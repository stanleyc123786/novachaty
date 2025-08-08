const socket = io();
const usernameForm = document.getElementById("usernameForm");
const usernameInput = document.getElementById("usernameInput");
const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const footer = document.querySelector("footer");

let username = '';
let myMessageIds = new Set();

usernameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  username = usernameInput.value.trim();
  if (username) {
    usernameForm.style.display = "none";
    chat.hidden = false;
    footer.hidden = false;
    msgInput.focus();
  }
});

msgInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && msgInput.value.trim()) {
    const msg = {
      username,
      message: msgInput.value.trim()
    };
    socket.emit("chat", msg);
    msgInput.value = "";
  }
});

socket.on("load-messages", (msgs) => {
  chat.innerHTML = "";
  msgs.forEach(displayMessage);
});

socket.on("chat", (msg) => {
  displayMessage(msg);
});

socket.on("delete-message", ({ id }) => {
  const msg = document.getElementById(id);
  if (msg) msg.remove();
});

function displayMessage(msg) {
  const li = document.createElement("li");
  li.id = msg.id;
  li.textContent = `${msg.username}: ${msg.message}`;
  if (msg.username === username) {
    li.classList.add("me");
    myMessageIds.add(msg.id);

    const btn = document.createElement("button");
    btn.textContent = "✕";
    btn.className = "delete-btn";
    btn.onclick = () => {
      const choice = confirm("OK = Delete for everyone\nCancel = Just you");
      socket.emit("delete-message", {
        id: msg.id,
        forAll: choice,
        username,
      });
    };
    li.appendChild(btn);
  } else {
    const btn = document.createElement("button");
    btn.textContent = "✕";
    btn.className = "delete-btn";
    btn.onclick = () => {
      socket.emit("delete-message", {
        id: msg.id,
        forAll: false,
        username
      });
    };
    li.appendChild(btn);
  }

  chat.appendChild(li);
  chat.scrollTop = chat.scrollHeight;
}
