<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.User.*', function ($user, $id) {
    return (int) $user->id === (int) $id;
});


Broadcast::channel('messenger.{sender}.{receiver}', function ($user, $sender, $receiver) {
    return $user->id == $sender || $user->id == $receiver;
});

Broadcast::channel('friend_request.{receiver}', function ($user, $receiver) {
    return $user->id == (int) Auth::user()->id;
});

Broadcast::channel('friend_accept.{receiver}', function ($user, $receiver) {
    return $user->id == (int) Auth::user()->id;
});

Broadcast::channel('group_chat.{roomId}', function ($user, $roomId) {
    if (true) {
        return ['id' => $user->id, 'name' => $user->name];
    }
});
