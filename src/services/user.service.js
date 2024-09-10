const User = require('../models/user.model');
const bcrypt = require('bcrypt');

class UserServices {
    // Hash Password
    async hashPassword(password) {
        try{
            return await bcrypt.hash(password, 10);
        }catch (err) {
            return err
        }
    };

    // check Password
    async checkPassword(id, password) {
        try{
            let user = await this.findUserById(id);
            return await bcrypt.compare(password, user.password);
        }catch (err) {
            return err
        }
    };

    // Add New User
    async createUser(body) {
        try{
            return await User.create(body);
        }catch (err) {
            return err
        }
    };

    // Get User
    async findUser(body) {
        try{
            return await User.findOne(body).select("-password -refreshToken");
        }catch (err) {
            return err
        }
    };

    // Get User By Id
    async findUserById(userId) {
        try{
            return await User.findById(userId);
        }catch (err) {
            return err
        }
    };

    // Update User
    async updateUser(userId, body) {
        try{
            return await User.findByIdAndUpdate(userId, body, {new: true});
        }catch (err) {
            return err
        }
    };

    // Update User
    async updateUserByFiled(userId, body) {
        try{
            return await User.findOneAndUpdate({watchHistory: videoId}, body, {new: true});
        }catch (err) {
            return err
        }
    };
}

module.exports = new UserServices();