/**
 * Tệp này quản lý việc đồng bộ dữ liệu người dùng (Login, Register, Sync).
 * Hiện tại, nó đang chạy mô phỏng (Simulated Cloud) bằng cách lưu 1 tệp ảo trong trình duyệt.
 * Bạn có thể thay thế các hàm này bằng fetch() gọi đến JSONBin hoặc Firebase sau này.
 */

// Giả lập cơ sở dữ liệu lưu trên "Cloud"
function getMockCloudDB() {
    const db = localStorage.getItem('clickerCloudDB');
    return db ? JSON.parse(db) : { users: {} };
}

function saveMockCloudDB(db) {
    localStorage.setItem('clickerCloudDB', JSON.stringify(db));
}

// Biến lưu thông tin người dùng đang đăng nhập
let currentUser = null;

async function cloudLogin(username, password) {
    // Giả lập độ trễ mạng (Network Latency)
    await new Promise(resolve => setTimeout(resolve, 800));

    const db = getMockCloudDB();
    const userRecord = db.users[username];

    if (!userRecord) {
        throw new Error('Tài khoản không tồn tại!');
    }
    
    if (userRecord.password !== password) {
        throw new Error('Sai mật khẩu!');
    }

    currentUser = username;
    return userRecord.data; // Trả về gameState của người dùng
}

async function cloudRegister(username, password) {
    await new Promise(resolve => setTimeout(resolve, 800));

    const db = getMockCloudDB();
    if (db.users[username]) {
        throw new Error('Tài khoản đã tồn tại! Vui lòng chọn tên khác.');
    }

    if (username.length < 3 || password.length < 3) {
        throw new Error('Tài khoản và mật khẩu phải có ít nhất 3 ký tự.');
    }

    // Tạo mới dữ liệu với state trống (sẽ được initGame tạo mặc định sau)
    db.users[username] = {
        password: password,
        data: null
    };

    saveMockCloudDB(db);
    currentUser = username;
    return null;
}

async function cloudSync(data) {
    if (!currentUser) return; // Không lưu nếu đang chơi chế độ Khách (Offline)

    console.log("☁️ Đang đồng bộ dữ liệu lên Cloud...");
    const db = getMockCloudDB();
    
    if (db.users[currentUser]) {
        db.users[currentUser].data = data;
        saveMockCloudDB(db);
        console.log("✅ Đồng bộ Cloud thành công cho user:", currentUser);
    }
}

// Kiểm tra xem máy này đã từng lưu phiên đăng nhập chưa
function checkAutoLogin() {
    const savedSession = localStorage.getItem('clickerSession');
    if (savedSession) {
        currentUser = savedSession;
        return true;
    }
    return false;
}

function saveSession(username) {
    localStorage.setItem('clickerSession', username);
}

function clearSession() {
    localStorage.removeItem('clickerSession');
    currentUser = null;
}
