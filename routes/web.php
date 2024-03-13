<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\NotesController;
use App\Http\Controllers\ProfileController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\RegisterController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/chat');
    }

    return view('welcome');
});

Route::get('/register', [RegisterController::class, 'create'])->name('register.create');
Route::post('register', [RegisterController::class, 'store'])->name('register.store');


Route::middleware('auth:api')->get('/user', function(Request $request) {
    return $request->user();
});

Route::middleware('auth')->group(function () {

    Route::group(['prefix' => 'chat', 'as' => 'chat.'], function (){
        Route::get('/', [ChatController::class, 'show'])->name('index')->middleware('auth');
        Route::get('/search', [ChatController::class, 'search'])->name('search')->middleware('auth');
        Route::post('/{receiverId?}', [ChatController::class, 'store'])->name('store');
        Route::post('/group/{groupId}', [ChatController::class, 'groupStore'])->name('groupStore');
        Route::get('/api/chat/{receiverId?}', [ChatController::class, 'getChatData'])->name('api.chat');
        Route::get('/api/group/{groupId?}', [ChatController::class, 'getGroupData'])->name('api.group');
        Route::get('/api/senderid', [ChatController::class, 'getSender'])->name('sender.chat');
        Route::post('/api/invite/{userId?}', [ChatController::class, 'friendRequest']);
        Route::post('/friend/accept/{user_id}', [ChatController::class, 'friendAccept']);
        Route::post('/friend/acceptt/{user_id}', [ChatController::class, 'friendAcceptt']);
        Route::post('/friend/decline/{userId?}', [ChatController::class, 'friendDecline']);
        Route::post('/api/leaveGroup/{receiverId?}', [GroupController::class, 'leaveGroup']);
        Route::post('/api/removeFriend/{receiverId?}', [ChatController::class, 'removeFriend']);

    })->middleware('auth');;

    Route::group(['prefix' => 'group', 'as' => 'group.'], function (){
        Route::get('/{groupid?}', [GroupController::class, 'show'])->name('index');
        Route::get('/api/group/{groupid?}', [GroupController::class, 'getGroupData']);
        Route::post('/remove/{userid?}/{groupid?}', [GroupController::class, 'removeFromGroup']);
        Route::post('/add/{useremail?}/{groupid?}', [GroupController::class, 'addToGroup']);
        Route::post('/change-name/{groupId}', [GroupController::class, 'renameGroup']);
        Route::post('/create', [GroupController::class, 'createGroup']);
        Route::post('/delete/{groupId}', [GroupController::class, 'deleteGroup']);
        Route::post('/leave/{groupId}', [GroupController::class, 'leaveGroup']);
    })->middleware('auth');


    Route::group(['prefix' => 'notes', 'as' => 'notes.'], function (){
        Route::get('/{noteId?}', [NotesController::class, 'show'])->name('index');
        Route::get('/api/note/{noteId?}', [NotesController::class, 'getNoteData']);
        Route::post('/color/{nodeId?}/{newColor?}', [NotesController::class, 'newColorNote']);
        Route::post('/change/{nodeId?}', [NotesController::class, 'newContentNote']);
        Route::get('/api/userData', [NotesController::class, 'getUserData']);
        Route::post('/addUser/{nodeId?}/{memberId?}', [NotesController::class, 'newMemberUserNote']);
        Route::post('/addGroup/{nodeId?}/{memberId?}', [NotesController::class, 'newMemberGroupNote']);
        Route::post('/removeUser/{nodeId?}/{memberId?}', [NotesController::class, 'removeMemberUserNote']);
        Route::post('/removeGroup/{nodeId?}/{memberId?}', [NotesController::class, 'removeMemberGroupNote']);
        Route::post('/delete/{nodeId?}', [NotesController::class, 'deleteNote']);
        Route::post('/create', [NotesController::class, 'createNote']);
    })->middleware('auth');

    Route::group(['prefix' => 'gallery', 'as' => 'gallery.'], function (){
        Route::get('/', [GalleryController::class, 'show'])->name('index');
        Route::post('/upload/{folderName?}', [GalleryController::class, 'upload']);
        Route::get('/photo/{userId}/{photoName?}', [GalleryController::class, 'showImg'])->name('photo.show');
        Route::get('/photo/{folderName?}/{userId}/{photoName?}', [GalleryController::class, 'showImgFolder'])->name('photo.show');
        Route::post('/rename/{photoId?}', [GalleryController::class, 'renameImg']);
        Route::post('/renameFolder/{photoId?}', [GalleryController::class, 'renameFolder']);
        Route::post('/delete/{folderId?}', [GalleryController::class, 'deleteImg']);
        Route::post('/deleteFolder/{photoId?}', [GalleryController::class, 'deleteFolder']);
        Route::get('/download/{photoId?}', [GalleryController::class, 'downloadImg']);
        Route::get('/{folderName?}', [GalleryController::class, 'showFolder']);
        Route::get('/shared/{folderName?}', [GalleryController::class, 'showFolder']);
        Route::post('/newFolder', [GalleryController::class, 'newFolder']);
        Route::get('/api/{elementType?}/{elementId?}', [GalleryController::class, 'getElementData']);
        Route::post('/addUser/{type?}/{elementId?}/{memberId?}', [GalleryController::class, 'newMemberUser']);
        Route::post('/addGroup/{type?}/{elementId?}/{memberId?}', [GalleryController::class, 'newMemberGroup']);
        Route::post('/removeUser/{type?}/{elementId?}/{memberId?}', [GalleryController::class, 'removeMemberUser']);
        Route::post('/removeGroup/{type?}/{elementId?}/{memberId?}', [GalleryController::class, 'removeMemberGroup']);
    })->middleware('auth');

    Route::group(['prefix' => 'profile', 'as' => 'profile.'], function (){
        Route::get('/', [ProfileController::class, 'show'])->name('index');
        Route::get('/api/userInfo', [ProfileController::class, 'userInfo'])->middleware('auth');
        Route::post('/uploadAvatar/', [ProfileController::class, 'upload']);
        Route::post('/update',  [ProfileController::class, 'update'])->name('update');
    })->middleware('auth');

    Route::group(['prefix' => 'calendar', 'as' => 'calendar.'], function (){
        Route::view('/', 'calendar');
        Route::get('/api/events', [CalendarController::class, 'show']);
        Route::get('/api/event/{eventId?}', [CalendarController::class, 'getEventData']);
        Route::post('/eventCreate', [CalendarController::class, 'createEvent']);
        Route::post('/eventEdit/{eventId?}', [CalendarController::class, 'editEvent']);
        Route::post('/eventDelete/{eventId?}', [CalendarController::class, 'deleteEvent']);
        Route::post('/addUser/{eventId?}/{memberId?}', [CalendarController::class, 'newMemberUser']);
        Route::post('/addGroup/{eventId?}/{memberId?}', [CalendarController::class, 'newMemberGroup']);
        Route::post('/removeUser/{eventId?}/{memberId?}', [CalendarController::class, 'removeMemberUser']);
        Route::post('/removeGroup/{eventId?}/{memberId?}', [CalendarController::class, 'removeMemberGroup']);
    })->middleware('auth');

    Route::group(['prefix' => 'admin', 'as' => 'admin.'], function (){
        Route::get('/users', [AdminController::class, 'showUsers'])->name('users');
        Route::get('/users/delete/{userId?}', [AdminController::class, 'deleteUser'])->name('users.delete');
        Route::get('/users/removeAvatar/{userId?}', [AdminController::class, 'removeAvatar'])->name('users.removeAvatar');
        Route::get('/users/edit/{userId?}', [AdminController::class, 'editUser'])->name('users.edit');
        Route::put('/users/edit/{userId?}', [AdminController::class, 'updateUser']);
    })->middleware('auth');
});


require __DIR__.'/auth.php';


