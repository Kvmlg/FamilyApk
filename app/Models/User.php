<?php

namespace App\Models;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    public $timestamps = false;
    use Notifiable;

    protected $fillable = [
        'name', 'surname', 'phone_number', 'email', 'password','password_confirmation','avatar_url'
    ];

    protected $hidden = [
        'password',
    ];
    public function groups()
    {
        return $this->hasMany(Group::class, 'owner');
    }

    public function events()
    {
        return $this->hasMany(Event::class, 'owner');
    }

    public function eventsMem()
    {
        return $this->belongsToMany(Event::class, 'events_members', 'users_id', 'events_id');
    }

    public function notes()
    {
        return $this->hasMany(Note::class, 'owner');
    }

    public function folders()
    {
        return $this->hasMany(Folder::class, 'owner');
    }

    public function foldersMem()
    {
        return $this->belongsToMany(Folder::class, 'folders_members', 'users_id', 'folders_id');
    }

    public function notesMem()
    {
        return $this->belongsToMany(Note::class, 'notes_members', 'users_id', 'notes_id')
            ->withPivot('color');
    }

    public function photos()
    {
        return $this->hasMany(Photo::class, 'owner');
    }

    public function photosMem()
    {
        return $this->belongsToMany(Photo::class, 'photos_members', 'users_id', 'photos_id');
    }

    public function photosMain()
    {
        return $this->hasMany(Photo::class, 'owner')
            ->whereNull('folder_id');
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function yoursFriends()
    {
        return $this->belongsToMany(User::class, 'friends', 'user_id','friend_id' )
            ->wherePivot('status', 'accepted');
    }

    public function friendAs()
    {
        return $this->belongsToMany(User::class, 'friends', 'friend_id', 'user_id' )
            ->wherePivot('status', 'accepted');
    }

    public function friendRequests()
    {
        return $this->belongsToMany(User::class, 'friends', 'friend_id', 'user_id' )
            ->wherePivot('status', 'send')->orderBy('id', 'asc');
    }

    public function groupsMem()
    {
        return $this->belongsToMany(Group::class, 'groups_members', 'users_id', 'group_id');
    }

    public function administrator()
    {
        return $this->hasOne(Administrators::class, 'users_id');
    }


    public function setPasswordAttribute($password)
    {
        $this->attributes['password'] = bcrypt($password);
    }
}
