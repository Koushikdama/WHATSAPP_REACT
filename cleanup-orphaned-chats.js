// Run this in the browser console to clean up orphaned chats
// Chats with participants that don't exist in the users collection

import('../firebase').then(({ db }) => {
    import('firebase/firestore').then(async ({ collection, getDocs, doc, deleteDoc, query, where }) => {
        console.log('🧹 Starting cleanup of orphaned chats...');

        // Get all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const userIds = new Set(usersSnapshot.docs.map(doc => doc.id));
        console.log(`Found ${userIds.size} users:`, Array.from(userIds));

        // Get all chats
        const chatsSnapshot = await getDocs(collection(db, 'chats'));
        console.log(`Found ${chatsSnapshot.size} chats total`);

        const chatsToDelete = [];

        for (const chatDoc of chatsSnapshot.docs) {
            const chatData = chatDoc.data();
            const chatId = chatDoc.id;

            if (chatData.type === 'individual') {
                const participants = chatData.participants || [];

                // Check if all participants exist
                const allParticipantsExist = participants.every(p => userIds.has(p));

                if (!allParticipantsExist) {
                    const missingParticipants = participants.filter(p => !userIds.has(p));
                    console.warn(`❌ Chat ${chatId} has missing participants:`, missingParticipants);
                    chatsToDelete.push(chatId);
                } else {
                    console.log(`✅ Chat ${chatId} is valid`);
                }
            }
        }

        if (chatsToDelete.length === 0) {
            console.log('✨ No orphaned chats found! Database is clean.');
            return;
        }

        console.log(`\n🗑️  Found ${chatsToDelete.length} orphaned chats to delete:`);
        chatsToDelete.forEach(id => console.log(`   - ${id}`));

        const confirmDelete = confirm(`Delete ${chatsToDelete.length} orphaned chat(s)?`);

        if (confirmDelete) {
            for (const chatId of chatsToDelete) {
                await deleteDoc(doc(db, 'chats', chatId));
                console.log(`🗑️  Deleted chat: ${chatId}`);
            }
            console.log('✅ Cleanup complete! Please refresh the page.');
            alert('Cleanup complete! Please refresh the page to see changes.');
        } else {
            console.log('❌ Cleanup cancelled by user');
        }
    });
});