import { Chance } from "chance";
import * as given from "../../steps/given.mjs";
import * as when from "../../steps/when.mjs";
import { verifyAccessToken } from "../../steps/then.mjs";

const chance = new Chance();

test("Un Supervisore ottiene le attività sull’autenticazione.", async () => {

    const authedUser = await given.an_authenticated_supervisor();

    const {sub} = await verifyAccessToken(authedUser.accessToken)

    const tab = "auth"
    const filter= null
    const limit= 101
    const nextToken = null; 
    const response = await when.a_user_calls_getAuthLogs(authedUser, tab,filter,limit,nextToken);

    expect(response).toHaveProperty("items");
    expect(response.items).toBeInstanceOf(Array);
    expect(response.items.length).toBeGreaterThan(0); 
    expect(response.items.length).toBeLessThanOrEqual(limit);
    response.items.forEach((log) => {
    expect(log).toHaveProperty("id");
    expect(log).toHaveProperty("timestamp");
    expect(log).toHaveProperty("operationName");
    expect(log).toHaveProperty("operationType");
    expect(log).toHaveProperty("operationMessage");
    expect(log).toHaveProperty("author");
  });
  if (response.nextToken) {
    expect(typeof response.nextToken).toBe("string");
  }
}, 10000);


test("Un Supervisore ottiene le attività sugli utenti.", async () => {

    const authedUser = await given.an_authenticated_supervisor();

    const {sub} = await verifyAccessToken(authedUser.accessToken)

    const tab = "users"
    const filter= null
    const limit= 101
    const nextToken = null; 

    const response = await when.a_user_calls_getAuthLogs(authedUser, tab,filter,limit,nextToken);

    expect(response).toHaveProperty("items");
    expect(response.items).toBeInstanceOf(Array);
    expect(response.items.length).toBeGreaterThan(0); 
    expect(response.items.length).toBeLessThanOrEqual(limit);
    response.items.forEach((log) => {
    expect(log).toHaveProperty("id");
    expect(log).toHaveProperty("timestamp");
    expect(log).toHaveProperty("operationName");
    expect(log).toHaveProperty("operationType");
    expect(log).toHaveProperty("operationMessage");
    expect(log).toHaveProperty("author");
  });
  if (response.nextToken) {
    expect(typeof response.nextToken).toBe("string");
  }
}, 10000);


test("Un Supervisore ottiene le attività sui pazienti.", async () => {

    const authedUser = await given.an_authenticated_supervisor();

    const {sub} = await verifyAccessToken(authedUser.accessToken)

    const tab = "pazienti"
    const filter= null
    const limit= 101
    const nextToken = null; 

    const response = await when.a_user_calls_getAuthLogs(authedUser, tab,filter,limit,nextToken);

    expect(response).toHaveProperty("items");
    expect(response.items).toBeInstanceOf(Array);
    expect(response.items.length).toBeGreaterThan(0); 
    expect(response.items.length).toBeLessThanOrEqual(limit);
    response.items.forEach((log) => {
    expect(log).toHaveProperty("id");
    expect(log).toHaveProperty("timestamp");
    expect(log).toHaveProperty("operationName");
    expect(log).toHaveProperty("operationType");
    expect(log).toHaveProperty("operationMessage");
    expect(log).toHaveProperty("author");
  });
  if (response.nextToken) {
    expect(typeof response.nextToken).toBe("string");
  }
}, 10000);



test("Un Supervisore ottiene le attività sui report.", async () => {

    const authedUser = await given.an_authenticated_supervisor();

    const {sub} = await verifyAccessToken(authedUser.accessToken)

    const tab = "reports"
    const filter= null
    const limit= 101
    const nextToken = null; 

    const response = await when.a_user_calls_getAuthLogs(authedUser, tab,filter,limit,nextToken);


    expect(response).toHaveProperty("items");
    expect(response.items).toBeInstanceOf(Array);
    expect(response.items.length).toBeGreaterThan(0); 
    expect(response.items.length).toBeLessThanOrEqual(limit);
    response.items.forEach((log) => {
    expect(log).toHaveProperty("id");
    expect(log).toHaveProperty("timestamp");
    expect(log).toHaveProperty("operationName");
    expect(log).toHaveProperty("operationType");
    expect(log).toHaveProperty("operationMessage");
    expect(log).toHaveProperty("author");
  });
  if (response.nextToken) {
    expect(typeof response.nextToken).toBe("string");
  }
}, 10000);



test("Un Tutor prova ad ottenere le attività.", async () => {

    const authedUser = await given.an_authenticated_tutor();

    const {sub} = await verifyAccessToken(authedUser.accessToken)

    const tab = "auth"
    const filter= null
    const limit= 101
    const nextToken = null; 

    await expect(when.a_user_calls_getAuthLogs(authedUser, tab,filter,limit,nextToken))
        .rejects
        .toThrow("Not Authorized to access getLogs on type Query");

}, 10000);