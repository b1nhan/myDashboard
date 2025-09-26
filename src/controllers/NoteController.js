const Note = require('../models/Note');

class NoteController{
    static async getNote(req, res){
        try{
            const userID = req.user.id;
            const note = await Note.getNote(userID);
            res.json(note);
        }
        catch (err){
            console.error('Error fetching note:', err);
            res.status(500).send('Error fetching note');
        }
    }

    static async setNote(req, res){
        try{
            const userID = req.user.id;
            const note = req.body;

            await Note.setNote(userID, note.content);
            res.json({message: 'Note set successfully'});
        } catch (err){
            console.error('Error updating note F:', err);
            return res.status(500).send('Error updating note');
        }
    }
}

module.exports = NoteController;