<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Note extends Model
{
    protected $fillable = ['title','content', 'owner'];
    public $timestamps = false;
    use Notifiable;


    public function owner()
    {
        return $this->belongsTo(User::class, 'owner');
    }

    public function noteOwner()
    {
        return $this->belongsTo(User::class, 'owner');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'notes_members', 'notes_id', 'users_id')
            ->withPivot('created_at', 'groups_id');
    }

    public function groupMembers()
    {
        return $this->belongsToMany(Group::class, 'notes_members', 'notes_id', 'groups_id')
            ->withPivot('created_at');
    }

    public function groupMembersadd()
    {
        return $this->belongsToMany(User::class, 'notes_members', 'notes_id', 'users_id')
            ->withPivot('created_at', 'groups_id');
    }

    public function friendRequests()
    {
        return $this->belongsToMany(User::class, 'friends', 'friend_id', 'user_id' )
            ->wherePivot('status', 'send')->orderBy('id', 'asc');
    }

    public function authorizedUsers()
    {
        return $this->belongsToMany(User::class, 'notes_members', 'notes_id', 'users_id');
    }

    public function authorizedGroups()
    {
        return $this->belongsToMany(Group::class, 'notes_members', 'notes_id', 'groups_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'notes_id');
    }
}
