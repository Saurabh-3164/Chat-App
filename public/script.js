const socket = io();
let selectedUserId = null;

const username = prompt("Enter your name:");
socket.emit('register', username);

const userList = document.getElementById("users");
const chatWith = document.getElementById("chatWith");
const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");

socket.on("userList", (users) => {
  userList.innerHTML = '';
  users.forEach(([id, name]) => {
    if (id !== socket.id) {
      const li = document.createElement("li");
      li.textContent = name;
      li.classList.add("user");
      li.onclick = () => {
        selectedUserId = id;
        chatWith.textContent = `Chatting with ${name}`;
        messages.innerHTML = '';
      };
      userList.appendChild(li);
    }
  });
});

input.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && selectedUserId && input.value.trim()) {
    socket.emit('privateMessage', { to: selectedUserId, message: input.value });
    appendMessage(`You: ${input.value}`);
    input.value = '';
  }
});

socket.on('privateMessage', ({ from, fromName, message }) => {
  if (from === selectedUserId) {
    appendMessage(`${fromName}: ${message}`);
  }
});

function appendMessage(text) {
  const div = document.createElement("div");
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}
