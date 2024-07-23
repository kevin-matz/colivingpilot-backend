import {Router} from "express";
import { useJWT } from "../utils/jwt_utils.js";
import {
    deleteUser,
    getAllUsers, getUserById,
    login,
    register, updateUser
} from "../controller/user_controller.js"

const router = Router();

router.post('/', register);

router.post("/login", login);

router.get('/', useJWT(), getAllUsers);

router.get('/:id', useJWT(), getUserById);

router.delete("/", useJWT(), deleteUser);

router.put("/", useJWT(), updateUser);


// increase Beercounter OLD
/*router.put("/increaseBeercounter/:value", useJWT(), async (request, response)=>{
    try {

        const userId = request.auth.userId;

        const value = parseInt(request.params.value, 10); // Hier verwenden wir parseInt

        console.log(value)
        // Benutzer abrufen
        const user = await User.findById(userId);

        if (!user) {
            return response.notFound();
        }

        // Den beercounter-Wert erhöhen
        user.beercounter += value;

        // Das aktualisierte Dokument speichern
        const updatedUser = await user.save();

        response.status(200).json(updatedUser);

    } catch (error) {
        console.error(error);
        response.internalError();
    }
})

// decrease Beercounter
router.put("/decreaseBeercounter/:value", useJWT(), async (request, response)=>{
    try {

        const userId = request.auth.userId;

        const value = parseInt(request.params.value, 10); // Hier verwenden wir parseInt

        console.log(value)
        // Benutzer abrufen
        const user = await User.findById(userId);

        if (!user) {
            return response.notFound();
        }

        // Den beercounter-Wert erhöhen
        user.beercounter -= value;

        // Das aktualisierte Dokument speichern
        const updatedUser = await user.save();

        response.status(200).json(updatedUser);

    } catch (error) {
        console.error(error);
        response.internalError();
    }
})*/
export default router;