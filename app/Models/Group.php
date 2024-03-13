<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    protected $fillable = ['group_name', 'owner'];
    public $timestamps = false;

    public function groupOwner()
    {
        return $this->belongsTo(User::class, 'owner');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'groups_members', 'group_id', 'users_id');
    }

    public function events()
    {
        return $this->hasMany(Event::class, 'groups_id');
    }

    public function notes()
    {
        return $this->belongsToMany(Note::class, 'notes_members', 'groups_id', 'notes_id');
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
