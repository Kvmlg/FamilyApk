<?php

namespace App\Http\Controllers;

use App\Events\FriendRequest;
use App\Events\FriendRequestAccepted;
use App\Events\GroupChatMessage;
use App\Events\MessageSent;
use App\Models\Friend;
use App\Models\Group;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class ChatController extends Controller
{

    public function show()
    {
        $user = auth()->user();

        $friendsWithNames = $this->mapFriends($user->yoursFriends)
            ->values()
            ->toArray();

        $asFriendsWithNames = $this->mapFriends($user->friendAs)
            ->values()
            ->toArray();

        $friendRequests = $this->mapFriends($user->friendRequests)
            ->values()
            ->toArray();

        $groups = $user->groupsMem;

        $UserGroups = $groups->sortByDesc('id')->map(function ($sortedGroups) {
            return [
                'group_id' => $sortedGroups->id,
                'name' => $sortedGroups->group_name,
                'isOwner' => $sortedGroups->owner == Auth::user()->id ? 'owner' : null,
            ];
        })  ->values()
            ->toArray();

        $friendsWithNames = array_merge($friendsWithNames,$asFriendsWithNames);

        return view('chat', compact('friendsWithNames', 'friendRequests', 'UserGroups'));
    }

    public function search(Request $request)
    {
        $search = $request->input('search');

        $user = auth()->user();
        $friendsWithNames = $this->mapFriends($user->yoursFriends()
            ->where(function ($query) use ($search) {
                $query->where('users.name', 'LIKE', "%{$search}%")
                    ->orWhere('users.surname', 'LIKE', "%{$search}%");
            })
            ->get())
            ->values()
            ->toArray();

        $asFriendsWithNames = $this->mapFriends($user->friendAs()
            ->where(function ($query) use ($search) {
                $query->where('users.name', 'LIKE', "%{$search}%")
                    ->orWhere('users.surname', 'LIKE', "%{$search}%");
            })
            ->get())
            ->values()
            ->toArray();

        $friendRequests = $this->mapFriends($user->friendRequests)
            ->values()
            ->toArray();

        $groups = $user->groupsMem;

        $UserGroups = $groups->sortByDesc('id')->map(function ($sortedGroups) {
            return [
                'group_id' => $sortedGroups->id,
                'name' => $sortedGroups->group_name,
                'isOwner' => $sortedGroups->owner == Auth::user()->id ? 'owner' : null,
            ];
        })  ->values()
            ->toArray();

        $friendsWithNames = array_merge($friendsWithNames,$asFriendsWithNames);


        return view('chat', compact('friendsWithNames', 'friendRequests', 'UserGroups'));
    }

    private function mapFriends($friends)
    {
        return $friends->map(function ($friend) {
            return [
                'user_id' => $friend->id,
                'email' => $friend->email,
                'name' => $friend->name,
                'surname' => $friend->surname,
                'avatar_url' => $friend->avatar_url,
            ];
        });
    }
    public function store(Request $request, ?int $receiverId = null)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        if(empty($receiverId)){
            return back();
        }

        try {

            $message = Message::create([
                'sender_id' => (int) Auth::user()->id,
                'receiver_id' => $receiverId,
                'message' => $request->message,
            ]);

            event(new MessageSent($message, auth()->user(),$receiverId));


            $chatData = $this->getChatData($request, $receiverId);

            return response()->json(['success' => true, 'messages' => [$chatData]]);


        }catch (\Throwable $th){
            return response()->json(['success' => false, 'error' => $th->getMessage()], 500);
        }
    }

    public function groupStore(Request $request, ?int $groupId = null)
    {
        $request->validate([
            'message' => 'required|string',
        ]);
        if(empty($groupId)){
            return back();
        }

        try {

            $message = Message::create([
                'sender_id' => (int) Auth::user()->id,
                'group_receiver' => $groupId,
                'message' => $request->message,
            ]);

            $message->sender_name = Auth::user()->name;
            $message->sender_surnname = Auth::user()->surname;

            event(new GroupChatMessage($message, auth()->user(),$groupId));


            $chatData = $this->getGroupData($groupId);

            return response()->json(['success' => true, 'messages' => [$chatData]]);


        }catch (\Throwable $th){
            return response()->json(['success' => false, 'error' => $th->getMessage()], 500);
        }
    }

    public function getChatData(Request $request, ?int $receiverId = null)
    {
        $messages = Message::whereIn('sender_id', [$request->user()->id, $receiverId])
            ->whereIn('receiver_id', [$request->user()->id, $receiverId])
            ->where('group_receiver', null)
            ->get();
        User::find($receiverId) ? $receiver = User::find($receiverId)->only(['id','name','surname','avatar_url','user_description']) : $receiver = Group::find($receiverId)->only(['id','group_name']);
        $userId = Auth::user()->id;


        return response()->json(compact('messages',  'receiver','userId'));
    }

    public function getGroupData(?int $groupId = null)
    {
        $grupa = Group::find($groupId);
        $messages = Message::whereIn('group_receiver', $grupa)
            ->get();
        $receiver = $grupa->only(['id', 'group_name', 'owner', 'Photo_ulr']);
        $userId = Auth::user()->id;

        foreach ($messages as $message) {
            $sender = User::find($message->sender_id);
            $message->sender_name = $sender->name;
            $message->sender_surnname = $sender->surname;
        }

        $users = $grupa->members;

        $group_memb = $users->map(function ($users) {
            return [
                'name' => $users->name,
                'surname' => $users->surname,
                'email' => $users->email,
            ];
        })->values()->toArray();

        return response()->json(compact('messages',  'receiver','userId', 'group_memb'));
    }

    public function getSender()
    {
        $senderid = Auth::user()->id;

        return response()->json(compact('senderid'));
    }

    public function friendRequest($receiverEmail)
    {

        if (!filter_var($receiverEmail, FILTER_VALIDATE_EMAIL)) {
            return response()->json(['success' => false, 'message' => 'Wprowadzona wartość nie jest adresem e-mail!']);
        }elseif($receiverEmail==Auth::user()->email){
            return response()->json(['success' => false, 'message' => 'Nie możesz zaprosić siebie!']);
        }else{
            try {
                $user = Auth::user();
                $friend = User::where('email',$receiverEmail)->first();
                if(!$friend){
                    return response()->json(['success' => false, 'message' => 'Brak użytkownika o takim adresie e-mail!']);
                }
                if (Friend::where([
                        'user_id' => $user->id,
                        'friend_id' => $friend->id,
                    ])->exists() || Friend::where([
                        'user_id' => $friend->id,
                        'friend_id' => $user->id,
                    ])->exists()) {
                    throw ValidationException::withMessages(['Zaposzenie juz istnieje']);
                }else{
                    Friend::create([
                        'user_id' => $user->id,
                        'friend_id' => $friend->id,
                    ]);
                }

                $SenderData = auth()->user()->only(['id','name','surname','avatar_url']);

                event(new FriendRequest(auth()->user(),$friend,$SenderData));
                return response()->json(['success' => true, 'messages' => "Zaproszenie wyslane"]);


            } catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }
    }

    public function friendAccept($user_id)
    {
        $user = auth()->user();
        $receiver = User::find($user_id);
        $friendRequest = $user->friendRequests()->where('user_id', $receiver->id)->first();
        if ($friendRequest) {
            $user->friendRequests()->updateExistingPivot($receiver->id, ['status' => 'accepted']);
        } else {
            return response()->json(['error' => 'Zaproszenie do znajomych nie znalezione'], 404);
        }

        event(new FriendRequestAccepted($receiver,auth()->user()));
        event(new FriendRequestAccepted(auth()->user(),$receiver));
        return response()->json(['success' => true, 'messages' => "Zaproszenie zaakceptowane"]);
    }

    public function friendAcceptt($user_id)
    {
        $user = auth()->user();
        $receiver = User::find($user_id);
        $friendRequest = $user->friendRequests()->where('user_id', $receiver->id)->first();
        if ($friendRequest) {
            $user->friendRequests()->updateExistingPivot($receiver->id, ['status' => 'accepted']);
        } else {
            return response()->json(['error' => 'Zaproszenie do znajomych nie znalezione'], 404);
        }

        event(new FriendRequestAccepted($receiver,auth()->user()));
        event(new FriendRequestAccepted(auth()->user(),$receiver));
        return back();
    }

    public function friendDecline($user_id)
    {
        $user = auth()->user();
        $friendRequest = $user->friendRequests()->where('user_id', $user_id)->first();
        if ($friendRequest) {
            $user->friendRequests()->detach();
        } else {
            return response()->json(['error' => 'Zaproszenie do znajomych nie znalezione'], 404);
        }
        return back();
    }
    public function removeFriend($friendId)
    {

        $requester = Auth::user();

        try {
            $userFriend = $requester->yoursFriends()->where('friend_id', $friendId)->first();
            $friendUser = $requester->friendAs()->where('user_id', $friendId)->first();

            if ($userFriend) {
                $requester->yoursFriends()->detach($friendId);
            } elseif ($friendUser) {
                $requester->friendAs()->detach($friendId);
            }

            return response()->json(['success' => true, 'message' => "Konwersacja usunięta!"]);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }

}
