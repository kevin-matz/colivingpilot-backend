import mongoose from "mongoose";
import User from "./user_model.js";
const Schema = mongoose.Schema;

const shoppingItemSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    notes: String,
    creator: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true
    },
    isChecked: Boolean
});

const wgSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    invitationCode: {
        type: String,
        required: true,
        unique: true
    },
    maximumMembers: {
        type: Number,
        get: v => Math.round(v),
        set: v => Math.round(v),
        required: true
    },
    members: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
        unique: true
    }],
    creator: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    shoppingList: [shoppingItemSchema]
});

wgSchema.statics.createWG = async function (user, name, invitationCode, maximumMembers, additionalUsernames = []) {
    let members = [ user._id ];
    for (const usernameToAdd of additionalUsernames) {
        const userToAdd = await User.findOne({ username: usernameToAdd });
        members.push(userToAdd._id);
    }

    const wg = await this.create({
        name: name,
        invitationCode: invitationCode,
        members: members,
        maximumMembers: maximumMembers,
        creator: user._id,
        shoppingList: []
    });
    await wg.save();

    for (const memberId of members) {
        const member = await User.findById(memberId);
        member.wg = wg._id;
        await member.save();
    }
};

wgSchema.methods.renameWG = async function (name) {
    this.name = name;
    await this.save();
};

wgSchema.methods.delete = async function () {
    for (const memberId of this.members) {
        const member = await User.findById(memberId);
        member.wg = null;
        await member.save();
    }

    await this.deleteOne({ _id: this._id });
};

wgSchema.methods.containsUser = function (user) {
    return user.wg._id.toString() === this._id.toString();
};

wgSchema.methods.getMemberCount = function () {
    return this.members.length;
};

wgSchema.methods.addUser = async function (user) {
    this.members.push(user._id);
    await this.save();

    user.wg = this._id;
    await user.save();
};

wgSchema.methods.removeUser = async function (user) {
    if (this.members.length === 1) {
        await this.delete();
        return;
    }

    this.members = this.members.filter(memberId => memberId.toString() !== user._id.toString());

    const wasCreator = this.creator.toString() === user._id.toString();
    if (wasCreator) {
        this.creator = this.members[0]._id;
    }

    await this.save();

    user.wg = null;
    await user.save();
};

wgSchema.methods.addShoppingListItem = async function (user, title, notes) {
    const shoppingItem = {
        title: title,
        notes: notes,
        creator: user._id,
        isChecked: false
    };
    this.shoppingList.push(shoppingItem);

    await this.save();
};

wgSchema.methods.checkShoppingListItem = async function (id, checked) {
    for (const item of this.shoppingList) {
        if (item._id.toString() !== id.toString())
            continue;

        item.isChecked = checked;
        break;
    }
    await this.save();
};

wgSchema.methods.updateShoppingListItem = async function (id, title, notes) {
    for (const item of this.shoppingList) {
        if (item._id.toString() !== id.toString())
            continue;

        item.title = title;
        item.notes = notes;
        break;
    }
    await this.save();
};

wgSchema.methods.removeShoppingListItemByID = async function (id) {
    this.shoppingList = this.shoppingList.filter(item => item._id.toString() !== id.toString());
    await this.save();
};

export default mongoose.model("WG", wgSchema);