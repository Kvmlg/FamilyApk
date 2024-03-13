/**
 * First we will load all of this project's JavaScript dependencies which
 * includes React and other helpers. It's a great starting point while
 * building robust, powerful web applications using React + Laravel.
 */

import './bootstrap';

/**
 * Next, we will create a fresh React component instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

document.addEventListener('DOMContentLoaded', function() {
    const chatPageElement = document.getElementById('chatPage');

    if (chatPageElement) {
        const toggleUsersButton = document.getElementById('toggleUsers');
        const toggleGroupsButton = document.getElementById('toggleGroups');
        const usersSection = document.getElementById('usersSection');
        const groupsSection = document.getElementById('groupsSection');
        const invite = document.getElementById('Invite');

        toggleUsersButton.addEventListener('click', function() {
            toggleUsers(true);
        });

        toggleGroupsButton.addEventListener('click', function() {
            toggleUsers(false);
        });

        function toggleUsers(showUsers) {
            if (showUsers) {
                invite.style.display = 'block';
                usersSection.style.display = 'block';
                groupsSection.style.display = 'none';
                toggleUsersButton.classList.add('font-bold');
                toggleUsersButton.classList.add('text-indigo-400');
                toggleUsersButton.classList.add('underline');
                toggleGroupsButton.classList.remove('font-bold');
                toggleGroupsButton.classList.remove('text-indigo-400');
                toggleGroupsButton.classList.remove('underline');
            } else {
                invite.style.display = 'none';
                usersSection.style.display = 'none';
                groupsSection.style.display = 'block';
                toggleUsersButton.classList.remove('font-bold');
                toggleUsersButton.classList.remove('text-indigo-400');
                toggleUsersButton.classList.remove('underline');
                toggleGroupsButton.classList.add('font-bold');
                toggleGroupsButton.classList.add('text-indigo-400');
                toggleGroupsButton.classList.add('underline');
            }
        }
    }
});

import './components/MessageZone';
import './components/GroupZone';
import './components/Invite';
import './components/Requests';
import './components/Notes';
import './components/Gallery';
import './components/Avatar';
import './components/Calendar';


