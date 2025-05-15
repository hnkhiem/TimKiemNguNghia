

export const logActivity = async (userId: number, type: string, description: string) => {
    if (!userId) return; 

    try {
        await fetch('http://localhost:5000/api/users/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, type, description })
        });
        console.log(`📝 Activity logged: ${type} - ${description}`);
    } catch (error) {
        console.error('Lỗi khi ghi activity:', error);
    }
};
