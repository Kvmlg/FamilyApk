<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = ['eventName', 'description', 'owner', 'date'];
    public $timestamps = false;

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner');
    }

    public function eventOwner()
    {
        return $this->belongsTo(User::class, 'owner');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'events_members', 'events_id', 'users_id')
            ->withPivot('created_at');
    }

    public function groupMembers()
    {
        return $this->belongsToMany(Group::class, 'events_members', 'events_id', 'groups_id')
            ->withPivot('created_at');
    }

    public function groupMembersadd()
    {
        return $this->belongsToMany(User::class, 'events_members', 'events_id', 'users_id')
            ->withPivot('created_at', 'groups_id');
    }

    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id');
    }

    public function nodes()
    {
        return $this->hasManyThrough(Note::class, User::class, 'id', 'owner');
    }

    public function photos()
    {
        return $this->hasManyThrough(Photo::class, User::class, 'id', 'owner');
    }

    public function messages()
    {
        return $this->hasManyThrough(Message::class, User::class, 'id', 'group_receiver');
    }
}
