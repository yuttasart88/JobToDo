document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todoInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const assigneeInput = document.getElementById('assigneeInput');
    const locationInput = document.getElementById('locationInput');
    const addTodoButton = document.getElementById('addTodoButton');
    const todoList = document.getElementById('todoList');

    let todos = loadTodos(); // โหลดรายการสิ่งที่ต้องทำจาก Local Storage

    renderTodos(); // แสดงรายการที่มีอยู่เมื่อโหลดหน้าเว็บ

    // Event Listeners
    addTodoButton.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTodo();
        }
    });

    function addTodo() {
        const todoText = todoInput.value.trim();
        const dueDate = dueDateInput.value; // YYYY-MM-DD format
        const assignee = assigneeInput.value.trim();
        const location = locationInput.value.trim();

        const now = new Date();
        const createdDateTime = now.toLocaleString('th-TH', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        if (todoText === '') {
            alert('กรุณาพิมพ์สิ่งที่ต้องทำ');
            return;
        }

        const newTodo = {
            id: Date.now(), // ใช้ timestamp เป็น ID
            text: todoText,
            completed: false,
            createdAt: createdDateTime,
            dueDate: dueDate, // เก็บวันที่ครบกำหนด
            assignee: assignee, // เก็บผู้ดำเนินงาน
            location: location // เก็บสถานที่นัดหมาย
        };

        todos.push(newTodo);
        saveAndRenderTodos(); // บันทึกและแสดงผลใหม่

        todoInput.value = ''; // ล้างช่อง input
        dueDateInput.value = ''; // ล้างช่องวันที่
        assigneeInput.value = ''; // ล้างช่องผู้ดำเนินงาน
        locationInput.value = ''; // ล้างช่องสถานที่
    }

    function renderTodos() {
        // เรียงลำดับรายการ
        // 1. รายการที่ยังไม่เสร็จ และมี dueDate ที่ถึงกำหนด/เลยกำหนดแล้ว (แสดงเปลวไฟ)
        // 2. รายการที่ยังไม่เสร็จ และมี dueDate ที่ใกล้ที่สุด
        // 3. รายการที่ยังไม่เสร็จ และมี dueDate ที่ไกลกว่านั้น หรือไม่มี dueDate
        // 4. รายการที่เสร็จแล้ว (completed) จะอยู่ล่างสุด
        const sortedTodos = [...todos].sort((a, b) => {
            // ย้ายรายการที่เสร็จแล้วไปอยู่ท้ายสุด
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            if (a.completed && b.completed) return 0; // ถ้าทั้งคู่เสร็จแล้ว ไม่ต้องเรียงเพิ่มเติมตามนี้

            const today = new Date();
            today.setHours(0, 0, 0, 0); // ตั้งเวลาเป็น 00:00:00 เพื่อเปรียบเทียบแต่วันที่

            const aDueDate = a.dueDate ? new Date(a.dueDate) : null;
            const bDueDate = b.dueDate ? new Date(b.dueDate) : null;

            // ตรวจสอบว่าถึงกำหนดแล้วหรือยังสำหรับ a
            const aIsDue = aDueDate && aDueDate <= today;
            // ตรวจสอบว่าถึงกำหนดแล้วหรือยังสำหรับ b
            const bIsDue = bDueDate && bDueDate <= today;

            // Priority 1: รายการที่ "ถึงกำหนดแล้ว" จะมาก่อน
            if (aIsDue && !bIsDue) return -1;
            if (!aIsDue && bIsDue) return 1;

            // Priority 2: เรียงตามวันที่ครบกำหนดที่ใกล้ที่สุด
            if (aDueDate && bDueDate) {
                return aDueDate - bDueDate;
            }
            // Priority 3: รายการที่มี dueDate จะมาก่อนรายการที่ไม่มี dueDate
            if (aDueDate && !bDueDate) {
                return -1;
            }
            if (!aDueDate && bDueDate) {
                return 1;
            }
            return 0; // ถ้าทั้งคู่ไม่มี dueDate หรือเปรียบเทียบไม่ได้
        });


        todoList.innerHTML = ''; // ล้างรายการเดิมก่อนสร้างใหม่

        const today = new Date();
        today.setHours(0, 0, 0, 0); // ตั้งเวลาเป็น 00:00:00 เพื่อเปรียบเทียบแต่วันที่

        sortedTodos.forEach(todo => {
            const listItem = document.createElement('li');
            listItem.dataset.id = todo.id; // เก็บ id ไว้ใน element
            if (todo.completed) {
                listItem.classList.add('completed');
            }

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.completed;
            checkbox.addEventListener('change', () => toggleComplete(todo.id));

            const contentDiv = document.createElement('div');
            contentDiv.classList.add('todo-content');

            const textSpan = document.createElement('span');
            textSpan.classList.add('todo-text');
            textSpan.textContent = todo.text;

            const metaSpan = document.createElement('div'); // เปลี่ยนเป็น div เพื่อให้ขึ้นบรรทัดใหม่ได้ดีขึ้น
            metaSpan.classList.add('todo-meta');

            // แสดงวันที่บันทึกและวันครบกำหนด
            let dateTimeText = `บันทึกเมื่อ: ${todo.createdAt}`;
            if (todo.dueDate) {
                const dueDateFormatted = new Date(todo.dueDate).toLocaleDateString('th-TH');
                dateTimeText += ` | กำหนดแล้วเสร็จ: ${dueDateFormatted}`;
            }
            const dateTimeSpan = document.createElement('span');
            dateTimeSpan.textContent = dateTimeText;
            metaSpan.appendChild(dateTimeSpan);

            // แสดงผู้ดำเนินงาน
            if (todo.assignee) {
                const assigneeSpan = document.createElement('span');
                assigneeSpan.textContent = `ผู้ดำเนินงาน: ${todo.assignee}`;
                metaSpan.appendChild(assigneeSpan);
            }

            // แสดงสถานที่นัดหมาย
            if (todo.location) {
                const locationSpan = document.createElement('span');
                locationSpan.textContent = `สถานที่: ${todo.location}`;
                metaSpan.appendChild(locationSpan);
            }

            contentDiv.appendChild(textSpan);
            contentDiv.appendChild(metaSpan);

            // เพิ่มไอคอนแจ้งเตือน (รูปเปลวไฟ) ถ้าถึงกำหนดแล้ว (วันนี้หรือเกินวันนี้ไปแล้ว) และยังไม่เสร็จ
            if (todo.dueDate && !todo.completed) {
                const dueDateObj = new Date(todo.dueDate);
                dueDateObj.setHours(0, 0, 0, 0); // ตั้งเวลาเป็น 00:00:00 เพื่อเปรียบเทียบแต่วันที่

                if (dueDateObj <= today) { // ถ้าวันที่ครบกำหนด <= วันนี้ (หมายถึงถึงกำหนดแล้วหรือเลยกำหนดแล้ว)
                    const alertIcon = document.createElement('i');
                    alertIcon.classList.add('fas', 'fa-fire', 'due-alert-icon'); // Font Awesome fire icon
                    listItem.prepend(alertIcon); // เพิ่มไอคอนไว้หน้าสุดของ listItem
                    listItem.classList.add('due-soon'); // เพิ่ม class เพื่อเปลี่ยนสีเป็นส้มอ่อน
                }
            }

            const deleteButton = document.createElement('button');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'ลบ';
            deleteButton.addEventListener('click', () => deleteTodo(todo.id));

            listItem.appendChild(checkbox);
            listItem.appendChild(contentDiv);
            listItem.appendChild(deleteButton);
            todoList.appendChild(listItem);
        });
    }

    function toggleComplete(id) {
        const todoIndex = todos.findIndex(todo => todo.id === id);
        if (todoIndex > -1) {
            todos[todoIndex].completed = !todos[todoIndex].completed;
            saveAndRenderTodos();
        }
    }

    function deleteTodo(id) {
        // ลบเฉพาะรายการที่ completed เท่านั้น
        const todoToDelete = todos.find(todo => todo.id === id);
        if (todoToDelete && todoToDelete.completed) {
            // ให้ผู้ใช้ยืนยันการลบอีกครั้ง
            if (confirm('ต้องการลบรายการนี้ใช่ไหม?')) { // เปลี่ยนข้อความยืนยัน
                todos = todos.filter(todo => todo.id !== id);
                saveAndRenderTodos();
            }
        } else {
            alert('กรุณาติ๊กถูกรายการที่เสร็จแล้วก่อนลบค่ะ');
        }
    }

    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    function loadTodos() {
        const savedTodos = localStorage.getItem('todos');
        return savedTodos ? JSON.parse(savedTodos) : [];
    }

    function saveAndRenderTodos() {
        saveTodos();
        renderTodos();
    }
});