<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Folder extends Model
{
    protected $fillable = ['id','name','owner'];
    public $timestamps = false;

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner');
    }

    public function folderOwner()
    {
        return $this->belongsTo(User::class, 'owner');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'folders_members', 'folders_id', 'users_id');
    }

    public function groupMembers()
    {
        return $this->belongsToMany(Group::class, 'folders_members', 'folders_id', 'groups_id')
            ->withPivot('created_at');
    }

    public function photos()
    {
        return $this->hasMany(Photo::class, 'folder_id');
    }
}
