import * as given from "../../steps/given.mjs";
import * as when from "../../steps/when.mjs";

test("Un Supervisore registra un nuovo utente.", async () => {

    const authedUser = await given.an_authenticated_supervisor();

    const newUser = given.a_new_user();

    const response = await when.a_user_calls_signupNewUser(authedUser, newUser);

    expect(response).toBe(true);

});

test("Un Tutor prova a registrare un nuovo utente.", async () => {

    const authedUser = await given.an_authenticated_tutor();

    const newUser = given.a_new_user();

    await expect(when.a_user_calls_signupNewUser(authedUser, newUser))
    .rejects
    .toThrow("Not Authorized to access signUpNewUser on type Mutation");

});

test("Un Supervisore registra un utente già esistente.", async () => {

    const authedUser = await given.an_authenticated_supervisor();

    const existingEmail = given.an_existing_user_credentials().email;
    const newUser = given.a_new_user();
    let editNewUser = {...newUser, email: existingEmail};

    await expect(when.a_user_calls_signupNewUser(authedUser, editNewUser))
    .rejects
    .toThrow("User account already exists");

});

test("Un utente vuole ottenere la pagina del profilo di un collega.", async () => {

    const authedUser = await given.an_authenticated_tutor();

    const collegueUserId = "c2656444-f011-7091-f5d0-f2959728a4cd";

    const response = await when.a_user_calls_getUser(authedUser, collegueUserId)

    expect(response).toMatchObject({
        active: expect.any(String),
        birthdate: expect.any(String),
        codfis: expect.any(String),
        comune: expect.any(String),
        createdAt: expect.any(String),
        email: expect.any(String),
        gender: expect.any(String),
        id: expect.any(String),
        name: expect.any(String),
        pazientiCount: expect.any(Number),
        phone_number: expect.any(String),
        provincia: expect.any(String),
        reportsCount: expect.any(Number),
        role: expect.any(String),
        surname: expect.any(String),
        tasksCount: expect.any(Number),
        title: expect.any(String),
        updatedAt: expect.any(String),
    })
});

test("Un utente vuole ottenere la pagina del profilo di un utente non collega.", async () => {

    const authedUser = await given.an_authenticated_tutor();

    const notCollegueUserId = "8255d404-3091-7020-4606-05613d592067";

    await expect(when.a_user_calls_getUser(authedUser, notCollegueUserId))
    .rejects
    .toThrow("Unauthorized");

});

test("Un Supervisore elimina un utente dal sistema.", async () => {

    const authedUser = await given.an_authenticated_supervisor();

    const userIdToDelete = "02c5e474-7051-70b7-f5a2-149efd8d7560";

    const response = await when.a_user_calls_deleteUser(authedUser, userIdToDelete)

    expect(response).toBe(true);

});

test("Un Supervisore prova ad eliminare un utente non esistente sul sistema.", async () => {

    const authedUser = await given.an_authenticated_supervisor();

    const userIdToDelete = "6255d494-0011-7079-5388-4bf3b99242b9";

    await expect(when.a_user_calls_deleteUser(authedUser, userIdToDelete))
    .rejects
    .toThrow("User does not exist.");
    
});