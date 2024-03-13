<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Friend extends Model
{
    public $timestamps = false;
    protected $fillable = ['user_id', 'friend_id'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function friend()
    {
        return $this->belongsTo(User::class, 'friend_id');
    }

    public function userGroups()
    {
        return $this->hasManyThrough(Group::class, User::class, 'id', 'owner');
    }

    public function friendGroups()
    {
        return $this->hasManyThrough(Group::class, User::class, 'id', 'owner', 'friend_id');
    }

    public function userEvents()
    {
        return $this->hasManyThrough(Event::class, User::class, 'id', 'owner');
    }

    public function friendEvents()
    {
        return $this->hasManyThrough(Event::class, User::class, 'id', 'owner', 'friend_id');
    }

    public function userNodes()
    {
        return $this->hasManyThrough(Note::class, User::class, 'id', 'owner');
    }

    public function friendNodes()
    {
        return $this->hasManyThrough(Note::class, User::class, 'id', 'owner', 'friend_id');
    }

    public function userPhotos()
    {
        return $this->hasManyThrough(Photo::class, User::class, 'id', 'owner');
    }

    public function friendPhotos()
    {
        return $this->hasManyThrough(Photo::class, User::class, 'id', 'owner', 'friend_id');
    }

    public function userMessages()
    {
        return $this->hasManyThrough(Message::class, User::class, 'id', 'sender_id');
    }

    public function friendMessages()
    {
        return $this->hasManyThrough(Message::class, User::class, 'id', 'sender_id', 'friend_id');
    }
}
