import * as given from "../../steps/given.mjs";
import * as when from "../../steps/when.mjs";
import * as then from "../../steps/then.mjs";

test("Verifica che l'utente esiste in DynamoDB e in Cognito.", async () => {

    const newUser = given.a_new_user();

    const event = {
        arguments: {
            newUser
        }
    }

    const response = await when.we_invoke_signUpNewUser(event);

    const { result, userId } = response;

    expect(result).toBe(true);

    const userExistInDynamoDB = await then.user_exists_in_UsersTable(userId);

    const userExistsInCognito = await then.user_exists_in_Cognito(userId);

    expect(userExistInDynamoDB.result).toBe(true);
    expect(userExistsInCognito.result).toBe(true);

});

test("Verifica che l'utente è stato eliminato da DynamoDB e da Cognito.", async () => {

    const newUser = given.a_new_user();

    const event = {
        arguments: {
            newUser
        }
    }

    const response = await when.we_invoke_signUpNewUser(event);

    const { result, userId } = response;

    expect(result).toBe(true);

    const eventDelete = {
        arguments: {
            userId
        }
    }

    const responseDelete = await when.we_invoke_deleteUser(eventDelete);

    expect(responseDelete).toBe(true);

    const userExistInDynamoDB = await then.user_exists_in_UsersTable(userId);

    const userExistsInCognito = await then.user_exists_in_Cognito(userId);

    expect(userExistInDynamoDB.user.active.S).toBe("true");
    expect(userExistsInCognito.result).toBe(false);

    
});