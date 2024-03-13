<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Photo extends Model
{
    protected $fillable = ['id','url', 'owner'];
    public $timestamps = false;
    use Notifiable;


    public function owner()
    {
        return $this->belongsTo(User::class, 'owner');
    }

    public function photoOwner()
    {
        return $this->belongsTo(User::class, 'owner');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'photos_members', 'photos_id', 'users_id');
    }

    public function groups()
    {
        return $this->belongsToMany(Group::class, 'photos_members', 'photos_id', 'group_id');
    }
    public function groupMembers()
    {
        return $this->belongsToMany(Group::class, 'photos_members', 'photos_id', 'groups_id')
            ->withPivot('created_at');
    }

    public function folder()
    {
        return $this->belongsTo(Folder::class, 'folder_id');
    }

}
