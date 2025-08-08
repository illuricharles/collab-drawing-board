# 🎨 collab-drawing-board

An interactive drawing application that allows users to draw, edit, and manage shapes on a canvas, supporting both individual work and real-time collaboration with multiple users.

---

## 🚀 Features

- Easy-to-use drawing tools such as rectangles, text etc...
- Easily manipulate shapes with capabilities to **move**, **resize**, and **delete**.
- Efficient local storage updates with debouncing to reduce writes.
- Real-time multi-user collaboration through dynamically generated shareable links.
- Real-time synchronization by using WebSocket backend managing sessions.
- When all participants leave a session, its data is removed.
- Returning users can rejoin sessions and resume their work seamlessly.

---

## 🛠 Technology Stack

- **Frontend:** Next.js, Tailwind CSS, TypeScript  
- **Backend:** Node.js, WebSocket (`ws`), TypeScript  
- **Monorepo Management:** Turborepo  
- **Package Manager:** pnpm  

---

## 📦 Setup and Run

1. Clone the repository:
    ```bash
    git clone https://github.com/illuricharles/collab-drawing-board.git
    ```

2. Navigate into the project directory and install dependencies/build packages:
    ```bash
    cd collab-drawing-board
    pnpm install
    pnpm build
    ```

3. Configure environment variables for both frontend and backend:

    - **Frontend (`/apps/web`):**
      ```
      cd apps/web
      cp .env.example .env
      ```
      Edit `.env` and set:
      ```
      LOCAL_STORAGE_DRAWING_KEY='my-drawings'
      NEXT_PUBLIC_WS_BACKEND="http://localhost:8080"
      ```

    - **Backend (`/apps/realtime-draw-server`):**
      ```bash
      cd ../realtime-draw-server
      cp .env.example .env
      ```
      Edit `.env` and set:
      ```
      ALLOWED_ORIGIN="http://localhost:3001"
      ```

4. Start the development servers in separate terminals:

    - **Frontend:**
      ```bash
      cd ../../apps/web
      pnpm dev
      ```

    - **Backend:**
      ```bash
      cd ../realtime-draw-server
      pnpm dev
      ```

5. Open [http://localhost:3001](http://localhost:3001) in your browser to use the application.

---

## ⚙️ How to Use

- Select your preferred drawing tool.
- Draw shapes on the canvas, then select them to modify or remove as needed.
- Enable live collaboration through the menu to generate a unique sharable link.
- Share the link with others to join the session and collaborate in real time.
- The backend maintains all active session data in memory and clears it once no participants remain.
- Rejoining a session with a valid link restores the latest drawing state instantly.

---

## 📷 Demo & Screenshots


![Main Interface](https://i.postimg.cc/6QF9rf62/Screenshot-2025-08-08-180933.png)
*Main drawing interface showing the toolbar and canvas.*


![Drawing and Editing](https://i.postimg.cc/hPLXX5BV/Screenshot-2025-08-08-191459.png) 
*Drawing shapes and editing them on the canvas.*


![Creating collab sharable link](https://i.postimg.cc/vHtmYxrz/Screenshot-2025-08-08-191736.png) 
*Creating sharable link for collaboration.*


![Live Collaboration](https://i.postimg.cc/cHDfv5Gs/Screenshot-2025-08-08-194846.png)  
*Real-time collaboration in action with multiple users.*


## 📄 License

This project is licensed under the [MIT License](LICENSE).
