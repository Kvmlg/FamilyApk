<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendRequestAccepted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(User $sender, User $receiver)
    {
        $this->sender = $sender;
        $this->receiver = $receiver;

    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('friend_accept.'.$this->sender->id),
        ];
    }

    public function broadcastAs()
    {
        return 'RequestAccepted';
    }

    public function broadcastWith()
    {
        return [
            'newFriendId' => $this->receiver->id,
            'newFriendName' => $this->receiver->name,
            'newFriendSurname' => $this->receiver->surname,
            'newFriendEmail' => $this->receiver->email,
            'newFriendUrl' => $this->receiver->avatar_url
        ];
    }
}
