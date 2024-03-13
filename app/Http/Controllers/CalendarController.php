<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CalendarController extends Controller
{
    public function show()
    {
        $requester=Auth::user();

        $UserEvent = $requester->events->map(function ($eventInfo) {
            $owner = User::find($eventInfo->owner);
            return [
                'id' => $eventInfo->id,
                'title' => $eventInfo->eventName,
                'description' => $eventInfo->description,
                'date' => $eventInfo->date,
                'isOwner' => $eventInfo->owner == Auth::user()->id ? 'owner' : null,
                'ownerName' => $owner->name." ".$owner->surname,
            ];
        })->values()->toArray();

        $UserEventShared = $requester->eventsMem->map(function ($eventInfo) {
            $owner = User::find($eventInfo->owner);
            return [
                'id' => $eventInfo->id,
                'title' => $eventInfo->eventName,
                'description' => $eventInfo->description,
                'date' => $eventInfo->date,
                'isOwner' => $eventInfo->owner == Auth::user()->id ? 'owner' : null,
                'ownerName' => $owner->name." ".$owner->surname,
            ];
        })->values()->toArray();

        $UserEvents = array_merge($UserEvent, $UserEventShared);

        return response()->json(compact('UserEvents'));
    }

    public function getEventData($eventId){
        $event =  Event::find($eventId);

        $requester=Auth::user();
        $eventUser = $event->members->filter(function ($user) {
            return !isset($user->pivot->groups_id);
        })->map(function ($user) {
            return [
                'user_id' => $user->id,
                'name' => $user->name,
                'surname' => $user->surname,
                'email' => $user->email,
                'created_at' => $user->pivot->created_at,
                'user_group' => $user->pivot->groups_id,
                'avatar_url'=>$user->avatar_url,
            ];
        })->values()->toArray();


        $eventGroup = $event->groupMembers->map(function ($group) {
            return [
                'group_id' => $group->id,
                'name' => $group->group_name,
                'created_at' => $group->pivot->created_at,
            ];
        })->values()->toArray();

        $groupedEventGroupMembers = [];
        foreach ($eventGroup as $member) {
            $groupedEventGroupMembers[$member['group_id']] = $member;
        }

        $eventGroupMembers = array_values($groupedEventGroupMembers);

        $eventMembers = array_merge($eventUser, $eventGroupMembers);
        usort($eventMembers, function ($a, $b) {
            return strtotime($b['created_at']) - strtotime($a['created_at']);
        });


        $groups = $requester->groupsMem->sortByDesc('id')->map(function ($sortedGroups) {
            return [
                'group_id' => $sortedGroups->id,
                'name' => $sortedGroups->group_name,
                'isOwner' => $sortedGroups->owner == Auth::user()->id ? 'owner' : null,
            ];
        })->values()->toArray();

        $friendsWithNames = $this->mapFriends($requester->yoursFriends)
            ->values()
            ->toArray();

        $asFriendsWithNames = $this->mapFriends($requester->friendAs)
            ->values()
            ->toArray();

        $allFriends = array_merge($friendsWithNames, $asFriendsWithNames);

        $friendsNotInNote = array_filter($allFriends, function ($friend) use ($eventUser) {
            return !in_array($friend['user_id'], array_column($eventUser, 'user_id'));
        });

        $groupsNotInNote = array_filter($groups, function ($group) use ($eventMembers) {
            return !in_array($group['group_id'], array_column($eventMembers, 'group_id'));
        });

        $userFriends = array_values($friendsNotInNote);
        $userGroups = array_values($groupsNotInNote);
        return response()->json(compact('eventMembers', 'userGroups', 'userFriends'));
    }

    private function mapFriends($friends)
    {
        return $friends->map(function ($friend) {
            return [
                'user_id' => $friend->id,
                'name' => $friend->name,
                'surname' => $friend->surname,
                'avatar_url'=>$friend->avatar_url,
            ];
        });
    }
    public function createEvent(Request $request)
    {
        $requester=Auth::user();
        $request->newData;
        $event = new Event();
        try {
            $this->validate($request, [
                'eventTitle' => 'min:3|max:45',
                'date' => 'date',
            ], [
                'eventTitle.min' => 'Minimalna długość tytułu to 3 znaki.',
                'eventTitle.max' => 'Maksymalna długość tytułu to 45 znaków.',
                'date.date' => 'Nieobsługiwany format daty.',
            ]);

            $event->eventName = $request->eventTitle;
            $event->description = $request->eventContent;
            $event->date = $request->date;
            $event->owner = $requester->id;
            $event->save();

            return response()->json(['success' => true, 'messages' => "Wydarzenie utworzone!"]);
        } catch (\Exception $th) {

            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }

    public function editEvent(Request $request, $eventId){

        $event = Event::find($eventId);
        if ($event && auth()->user()->id == $event->owner) {

            try {
                $this->validate($request, [
                    'eventTitle' => 'min:3|max:45',
                ], [
                    'eventTitle.min' => 'Minimalna długość tytułu to 3 znaki.',
                    'eventTitle.max' => 'Maksymalna długość tytułu to 45 znaków.',
                ]);

                $event->eventName = $request->eventTitle;
                $event->description = $request->eventContent;
                $event->save();
                return response()->json(['success' => true, 'messages' => 'Wydarzenie edytowane.']);
            } catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }
        return response()->json(['success' => false, 'message' => 'Brak takiego wydarzenia.'], 500);
    }

    public function deleteEvent($eventId)
    {
        $requester = Auth::user();
        $event = Event::find($eventId);
        if (!is_null($event) && $event->owner == $requester->id) {
            try {
                $event->members()->detach();
                $event->delete();
                return response()->json(['success' => true, 'messages' => "Wydarzenie zostało usunięte!"]);
            } catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        } else {
            throw ValidationException::withMessages(['Brak dostępu!']);
        }
    }

    public function newMemberGroup($eventId, $memberId)
    {
        $event = Event::find($eventId);
        $requester=Auth::user();
        $group = Group::where('id', $memberId)->first();
        $groupAdded = false;
        $addedUsers = [];
        try {
            if(!is_null($event) && ($event->owner == $requester->id)){
                $users = $group->members;
                $users->each(function ($user) use ($event, $group, &$groupAdded,&$addedUsers,&$type, $requester) {
                    if ($user->id !== $requester->id && !$event->members->contains($user->id)) {
                        $event->members()->attach($user->id, ['created_at' => now(), 'groups_id' => $group->id]);
                        $groupAdded = true;
                        $addedUsers[] = [
                            'user_id' => $user->id,
                            'name' => $user->name,
                            'surname' => $user->surname,
                            'email' => $user->email,
                            'avatar_url'=>$user->avatar_url,
                        ];
                    }
                });
                if (!$groupAdded) {
                    throw new \Exception('Wszyscy użytkownicy z grupy są już dodani!.');
                }
            }else{
                throw ValidationException::withMessages(['Brak dostępu!']);
            }
            return response()->json(['success' => true, 'messages' => "Grupa dodana!",'newGroup' => array_merge(['group_id' => $group->id],['name' => $group->group_name],['newUser' => $addedUsers])]);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }

    public function newMemberUser($eventId, $memberId)
    {
        $event = Event::find($eventId);
        $requester=Auth::user();
        $user = User::where('id', $memberId)->first();
        try {
            if(!is_null($event) && ($event->owner == $requester->id)){
                $event->members()->attach($user->id, ['created_at' => now()]);

            }else{
                throw ValidationException::withMessages(['Brak dostępu!']);
            }
            return response()->json(['success' => true, 'newUser'=> array_merge(['user_id' => $user->id],  $user->only(['name', 'surname', 'email', 'id', 'avatar_url']))]);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }

    public function removeMemberGroup($eventId, $memberId)
    {
        $event = Event::find($eventId);
        $requester=Auth::user();
        $group = Group::where('id', $memberId)->first();
        $deletedUsers=[];
        if(!is_null($event) && $event->owner == $requester->id){
            try {
                $event->groupMembers()->detach($group->id);
                $users = $group->members;
                $users->each(function ($user) use ( &$deletedUsers) {
                    if ($user->id !== Auth::user()->id){
                    $deletedUsers[] = [
                        'user_id' => $user->id,
                        'id' => $user->id,
                        'name' => $user->name,
                        'surname' => $user->surname,
                        'email' => $user->email,
                        'avatar_url'=>$user->avatar_url,
                    ];
                    }
                });
                return response()->json(['success' => true, 'removedGroup' => array_merge(['group_id' => $group->id],['name' => $group->group_name]),'deletedUsers'=>$deletedUsers]);
            }catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }else{
            throw ValidationException::withMessages(['Brak dostępu!']);
        }

    }

    public function removeMemberUser($eventId, $memberId)
    {
        $event = Event::find($eventId);
        $requester=Auth::user();
        $user = User::where('id', $memberId)->first();
        if(!is_null($event) && $event->owner == $requester->id){
            try {
                $event->members()->detach($user->id);

                return response()->json(['success' => true, 'removedUser' => array_merge(['user_id' => $user->id],  $user->only(['name', 'surname', 'email', 'id', 'avatar_url']))]);
            }catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }else{
            throw ValidationException::withMessages(['Brak dostępu!']);
        }

    }
}
