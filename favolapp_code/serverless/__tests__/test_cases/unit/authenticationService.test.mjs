import { generateRandomPassword } from "../../lib/lib.mjs";
import * as given from "../../steps/given.mjs";
import * as when from "../../steps/when.mjs";
import * as then from "../../steps/then.mjs";


test("Login con credenziali corrette.", async () => {

    const existingUser = given.an_existing_user_credentials();

    const response = await when.do_login(existingUser.email, existingUser.password);

    expect(response).toHaveProperty("idToken");
    expect(response).toHaveProperty("accessToken");
    expect(response).toHaveProperty("expireAt");
    expect(response).toHaveProperty("refreshToken");
    expect(response).toHaveProperty("username");

    expect(typeof response.idToken).toBe("string");
    expect(typeof response.accessToken).toBe("string");
    expect(response.expireAt instanceof Date).toBe(true);
    expect(typeof response.refreshToken).toBe("string");
    expect(typeof response.username).toBe("string");

    expect(response.idToken).toMatch(/^ey[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/); // JWT format
    expect(response.accessToken).toMatch(/^ey[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/); // JWT format
    expect(response.username).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);

});

test("Login con email non registrata.", async () => {

    const randomUser = given.a_random_user_credentials();

    await expect(when.do_login(randomUser.email, randomUser.password))
    .rejects
    .toThrow("Incorrect username or password.");

});

test("Login con password non corretta.", async () => {

    const existingUser = given.an_existing_user_credentials();

    await expect(when.do_login(existingUser.email, generateRandomPassword()))
    .rejects
    .toThrow("Incorrect username or password.");

});

test("Verifica della validità del token corretto.", async () => {

    const existingUser = given.an_existing_user_credentials();

    const authResponse = await when.do_login(existingUser.email, existingUser.password);

    const loggedUserAccessToken = authResponse.accessToken;
    
    const response = await then.verifyAccessToken(loggedUserAccessToken);

    expect(response).toMatchObject({
        sub: expect.any(String),
        'cognito:groups': expect.arrayContaining([expect.any(String)]),
        iss: expect.stringContaining('https://cognito-idp.eu-west-1.amazonaws.com/'),
        client_id: expect.any(String),
        origin_jti: expect.any(String),
        event_id: expect.any(String),
        token_use: expect.stringMatching(/access|id|refresh/),
        scope: expect.stringContaining('aws.cognito.signin.user.admin'),
        auth_time: expect.any(Number),
        exp: expect.any(Number),
        iat: expect.any(Number),
        jti: expect.any(String),
        username: expect.any(String)
    });

});

test("Verifica della validità del token errato.", async () => {

    const invalidAccessToken = given.a_random_accessToken();

    await expect(then.verifyAccessToken(invalidAccessToken))
    .rejects
    .toThrow("invalid signature");

});