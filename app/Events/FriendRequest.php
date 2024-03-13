<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FriendRequest implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(User $user, User $receiver, $senderData)
    {
        $this->user = $user;
        $this->receiver = $receiver;
        $this->senderData = $senderData;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('friend_request.'.$this->receiver->id),
        ];
    }

    public function broadcastAs(){
        return 'RequestSent';
    }

    public function broadcastWith(){
        return[
            'senderData' => $this->senderData
        ];
    }
}
