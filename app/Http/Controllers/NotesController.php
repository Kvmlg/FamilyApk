<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Note;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class NotesController extends Controller
{
    public function show()
    {
        $requester=Auth::user();
        $notes = $requester->notesMem;

        $UserNotes= $notes->sortByDesc('id')->map(function ($sortedNotes) {
            return [
                'id' => $sortedNotes->id,
                'title' => $sortedNotes->title,
                'content' => $sortedNotes->content,
                'color' => $sortedNotes->pivot->color,
                'isOwner' => $sortedNotes->owner == Auth::user()->id ? 'owner' : null,
            ];
        })->values()->toArray();

        return view('notes', compact('UserNotes'));
    }

    private function mapFriends($friends)
    {
        return $friends->map(function ($friend) {
            return [
                'user_id' => $friend->id,
                'name' => $friend->name,
                'surname' => $friend->surname,
                'avatar_url' => $friend->avatar_url,
            ];
        });
    }

    public function getNoteData($note_id){
        $note = Note::find($note_id);
        $requester=Auth::user();
        $owner = User::find($note->owner);
        if(!is_null($note) && $note->members->contains($requester->id)){
            $noteInfo=[
                    'id' => $note->id,
                    'title' => $note->title,
                    'content' => $note->content,
                    'isOwner' => $note->owner == Auth::user()->id ? 'owner' : null,
                    'noteOwner' => [
                        'user_id' => $owner->id,
                        'name' => $owner->name,
                        'surname' => $owner->surname,
                    ],
            ];

            $noteUser = $note->members->filter(function ($user) {
                return !isset($user->pivot->groups_id);
            })->map(function ($user) {
                return [
                    'user_id' => $user->id,
                    'name' => $user->name,
                    'surname' => $user->surname,
                    'email' => $user->email,
                    'created_at' => $user->pivot->created_at,
                    'user_group' => $user->pivot->groups_id,
                    'avatar_url' => $user->avatar_url,
                ];
            })->values()->toArray();

            $noteGroup = $note->groupMembers->map(function ($group) {
                return [
                    'group_id' => $group->id,
                    'name' => $group->group_name,
                    'created_at' => $group->pivot->created_at,
                ];
            })->values()->toArray();

            $groupedNoteGroupMembers = [];
            foreach ($noteGroup as $member) {
                $groupedNoteGroupMembers[$member['group_id']] = $member;
            }

            $noteGroupMembers = array_values($groupedNoteGroupMembers);

            $noteMembers = array_merge($noteUser, $noteGroupMembers);
            usort($noteMembers, function ($a, $b) {
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

            $friendsNotInNote = array_filter($allFriends, function ($friend) use ($noteMembers) {
                return !in_array($friend['user_id'], array_column($noteMembers, 'user_id'));
            });

            $groupsNotInNote = array_filter($groups, function ($group) use ($noteMembers) {
                return !in_array($group['group_id'], array_column($noteMembers, 'group_id'));
            });

            $userFriends = array_values($friendsNotInNote);
            $userGroups = array_values($groupsNotInNote);

        }else{
            return response()->json(['success' => false, 'message' => "Brak dostępu"], 500);
        }


        return response()->json(compact('noteInfo','noteMembers', 'userGroups', 'userFriends'));
    }

    public function newColorNote($note_id, $color){
        $requester=Auth::user();
        $note = $requester->notesMem()->where('users_id', $requester->id)->where('notes_id', $note_id)->first();
        try {
            $requester->notesMem()
                ->wherePivot('users_id', $requester->id)
                ->wherePivot('notes_id', $note_id)
                ->updateExistingPivot($note->id, ['color' => $color]);

            return response()->json(['success' => true, 'color'=> $color]);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }

    public function newContentNote(Request $request, $note_id){
        $requester=Auth::user();
        $note = $requester->notesMem()->where('users_id', $requester->id)->where('notes_id', $note_id)->first();
        $updatedData = $request->updatedData;

        try {
            if(!is_null($note) && ($note->owner == $requester->id)){
                if (array_key_exists('title', $updatedData)) {
                    $this->validate($request, [
                        'updatedData.title' => 'min:5|max:45',
                    ], [
                        'updatedData.title.min' => 'Minimalna długość tytułu to 3 znaki.',
                        'updatedData.title.max' => 'Maksymalna długość tytułu to 45 znaków.',
                    ]);

                    $note->title = $updatedData['title'];
                }

                if (array_key_exists('content', $updatedData)) {
                    $this->validate($request, [
                        'updatedData.content' => 'min:1|max:2500',
                    ], [
                        'updatedData.content.min' => 'Minimalna długość tytułu to 1 znak.',
                        'updatedData.content.max' => 'Maksymalna długość tytułu to 2500 znaków.',
                    ]);
                    $note->content = $updatedData['content'];
                }
                $note->save();
            }else{
                throw ValidationException::withMessages(['Brak dostępu!']);
            }
            return response()->json(['success' => true, 'messages' => "Zmieniono zawartość!"]);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }
    }

    public function newMemberUserNote($noteId, $memberId)
    {
        $requester=Auth::user();
        $note = Note::find($noteId);
        $user = User::where('id', $memberId)->first();
        try {
            if(!is_null($note) && ($note->owner == $requester->id)){
                $note->members()->attach($user->id, ['created_at' => now()]);
            }else{
                throw ValidationException::withMessages(['Brak dostępu!']);
            }
            return response()->json(['success' => true, 'newUser'=> array_merge(['user_id' => $user->id],  $user->only(['name', 'surname', 'email', 'id','avatar_url']))]);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }

    public function newMemberGroupNote($noteId, $memberId)
    {
        $requester=Auth::user();
        $note = Note::find($noteId);
        $group = Group::where('id', $memberId)->first();
        $groupAdded = false;
        $addedUsers = [];
        try {
            if(!is_null($note) && ($note->owner == $requester->id)){
                $users = $group->members;
                $users->each(function ($user) use ($note, $group, &$groupAdded,&$addedUsers) {

                    if (!$note->members->contains($user->id)) {
                        $note->members()->attach($user->id, ['created_at' => now(), 'groups_id' => $group->id]);
                        $groupAdded = true;
                        $addedUsers[] = [
                            'user_id' => $user->id,
                            'name' => $user->name,
                            'surname' => $user->surname,
                            'email' => $user->email,
                            'avatar_url' => $user->avatar_url,
                        ];
                    }
                });
                if (!$groupAdded) {
                    throw new \Exception('Wszyscy z użytkownicy grupy należą do notatki.');
                }
            }else{
                throw ValidationException::withMessages(['Brak dostępu!']);
            }
            return response()->json(['success' => true, 'messages' => "Grupa dodana!",'newGroup' => array_merge(['group_id' => $group->id],['name' => $group->group_name],['newUser' => $addedUsers])]);
        } catch (\Exception $th) {
            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }

    public function removeMemberGroupNote($noteId, $memberId)
    {
        $requester=Auth::user();
        $note = Note::find($noteId);
        $group = Group::where('id', $memberId)->first();
        $deletedUsers=[];
        if(!is_null($note) && $note->owner == $requester->id){
            try {
                $note->groupMembers()->detach($group->id);
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

    public function removeMemberUserNote($noteId, $memberId)
    {
        $requester=Auth::user();
        $note = Note::find($noteId);
        $user = User::where('id', $memberId)->first();
        if(!is_null($note) && $note->owner == $requester->id){
            try {
                $note->members()->detach($user->id);
                return response()->json(['success' => true, 'removedUser' => array_merge(['user_id' => $user->id],  $user->only(['name', 'surname', 'email', 'id','avatar_url']))]);
            }catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }else{
            throw ValidationException::withMessages(['Brak dostępu!']);
        }

    }

    public function deleteNote($noteId)
    {
        $requester=Auth::user();
        $note = Note::find($noteId);
        if(!is_null($note) && $note->owner == $requester->id){
            try {
                $note->members()->detach();
                $note->delete();
                return response()->json(['success' => true, 'messages' => "Notatka została usunięta!"]);
            }catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }else if(!is_null($note) && $note->members->contains($requester->id)){
            try {
                $note->members()->detach($requester->id);
                return response()->json(['success' => true, 'messages' => "Notatka została usunięta!"]);
            }catch (\Exception $th) {
                return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
            }
        }else{
            throw ValidationException::withMessages(['Brak dostępu!']);
        }

    }

    public function createNote(Request $request)
    {
        $requester=Auth::user();
        $newData = $request->newData;
        $note = new Note();
        try {
            if (array_key_exists('title', $newData)) {
                $this->validate($request, [
                    'newData.title' => 'min:5|max:45',
                ], [
                    'newData.title.min' => 'Minimalna długość tytułu to 3 znaki.',
                    'newData.title.max' => 'Maksymalna długość tytułu to 45 znaków.',
                ]);

                $note->title = $newData['title'];
            }
            if (array_key_exists('content', $newData)) {
                $this->validate($request, [
                    'newData.content' => 'min:1|max:2500',
                ], [
                    'newData.content.min' => 'Minimalna długość tytułu to 1 znak.',
                    'newData.content.max' => 'Maksymalna długość tytułu to 2500 znaków.',
                ]);
                $note->content = $newData['content'];
            }
            $note->owner = $requester->id;
            $note->save();
            $note->members()->attach($requester->id);

            return response()->json(['success' => true, 'messages' => "Notatka utworzona!"]);
        } catch (\Exception $th) {

            return response()->json(['success' => false, 'message' => $th->getMessage()], 500);
        }

    }
}
