const { Thought, User } = require('../models');

const thoughtController = {
    getAllThoughts(req, res) {
        Thought.find({})
        .select('-__v')
        .populate({
            path: 'reactions',
            select: '-__v'
        })
        .sort({ _id: -1 })
        .then(dbThoughtData => res.json(dbThoughtData))
        .catch(err => {
            console.log(err);
            res.status(400).json(err);
        })
    },
    getThoughtById({ params }, res) {
        Thought.findOne({ _id: params.id })
            .select('-__v')
            .populate({
                path: 'reactions',
                select: '-__v'
            })
            .then(dbThoughtData => {
                if (!dbThoughtData) {
                    res.status(404).json({ message: 'No thought found with this id!' });
                    return;
                }
                res.json(dbThoughtData);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },
    createThought({ body }, res) {
        Thought.create(body)
            .then(dbThoughtData => {
                return User.findByIdAndUpdate(
                    {_id: body.userId},
                    {$push: { thoughts: dbThoughtData}},
                    {new:true}
                    );
            })    
            .then(userData=>res.json(userData))
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },
    updateThought({ params, body }, res) {
        Thought.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
            .then(dbThoughtData => {
                if (!dbThoughtData) {
                    res.status(404).json({ message: 'no thought found' });
                    return;
                }
                res.json(dbThoughtData);
            })
            .catch(err => res.status(400).json(err));
    },
    deleteThought({ params }, res) {
        Thought.findOneAndDelete({ _id: params.id })
            .then(dbThoughtData => {
                if (!dbThoughtData) {
                    res.status(404).json({ message: 'no thought found' });
                    return;
                }
                return User.findByIdAndUpdate (
                    { _id: dbThoughtData.userId},
                    { $pull: { thoughts: params.id } },
                    { new: true }
                );  
            })
            .then(dbUserData => {
                res.json({ message: 'Thought deleted' });
            })
            .catch(err => res.status(400).json(err));
    },
    addReaction({params, body}, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $push: { reactions: body } },
            { new: true }
        )
        .then(dbThoughtData => {
            if (!dbThoughtData) {
                res.status(404).json({ message: 'no thought found' });
                return;
            }
            res.json(dbThoughtData);
        })
        .catch(err => res.status(400).json(err));
    },
    deleteReaction({ params, body }, res){
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: { reactionId: body.reactionId} } },
            { new: true }
        )
            .then(dbThoughtData => {
                if (!dbThoughtData) {
                    res.status(404).json({ message: 'no thought found' });
                    return;
                }
                res.json('Reaction Deleted');
            })
            .catch(err => res.status(400).json(err));
    }
};

module.exports = thoughtController;