import React from 'react';
import {render} from 'react-dom';
import AppState from './AppState';
import App from './App';
import Horizon from '@horizon/client';
import {computed, observable, action} from 'mobx';

const horizon = Horizon({host: 'localhost:5000'});
const appState = new AppState(horizon);

horizon.onReady(() => {
console.log ('horizon is ready');


    render(
        <App appState = {appState} />
            document.getElementbyId('root')
    );
});

console.log('connect horizon');
horizon.connect();

createRoom: (roomName) => {
    horizon('chatRooms').store({ name: roomName })
}

createMessage: (authorName, roomID, message) => {
    horizon('messages').store({
        author: authorName,
        date: new Date(),
        message: message,
        roomID: roomID
    });
}

horizon('messages').findAll({roomID: roomID}).order('date').watch().subscribe((data) => {
    // update message here

});

class ChatRoom {
    @observable name;
    id;

    constructor(data) {
        this.name = data.name;
        this.id = data.id;
    }
}

export class ChatRoomPageState {
    @observable text = '';

    @action setText(text) {
        this.text = text;
    }

    @action resetText() {
        this.text = '';
    }
}

class AppState {
    horizon;
    @observable userName;
    @observable roomName = 'onsenui';
    @observable chatRooms = [];
    @observable loading = false;
    @observable messages = [];
    @observable newMessage = false;

    constructor(horizon) {
        this.horizon = horizon;
        this.chatRooms = [];
    }

    @computed get messageList(){
        var list = this.messages.map((el) => el);
        for (var i = 1; i < list.length; i++){
            if (list[i-1].author === list[i].author){
                list[i].showAuthor = false;
            } else {
                list[i].showAuthor = true;
            }
        }
        if (list.length > 0){
            list[0].showAuthor = true;
        }
        return list;
    }
    @computed get lastAuthor(){
        if (this.messages.length === 0) {
            return '';
        }
        return this.messages[this.messages.length - 1].author;
    }
    @action setMessages(data){
        this.messages = data;
    }
    @action hideMessageNotification(){
        this.newMessage = false;
    }
    @action showMessageNotification(){
        if (this.newMessage) return;
        this.newMessage = true;
        setTimeout(() => this.newMessage = false,2000);
    }
    @action setChatRoom(data) {
        this.chatRooms = data.map((el) => new chatRoom(el));
    }
}

export default AppState;