import { Chance } from "chance";
import * as given from "../../steps/given.mjs";
import * as when from "../../steps/when.mjs";

const chance = new Chance();

test("Un Supervisore crea un nuovo paziente.", async () => {

    const authedUser = await given.an_authenticated_supervisor();

    const newPaziente = await given.a_new_paziente();

    const response = await when.a_user_calls_createNewPaziente(authedUser, newPaziente);

    expect(response).toBe(true);

});

test("Un Tutor prova a creare un nuovo paziente.", async () => {

    const authedUser = await given.an_authenticated_tutor();

    const newPaziente = await given.a_new_paziente();

    await expect(when.a_user_calls_createNewPaziente(authedUser, newPaziente))
        .rejects
        .toThrow("Not Authorized to access createNewPaziente on type Mutation");

});

test("Un Supervisore modifica un paziente.", async () => {

    const authedUser = await given.an_authenticated_supervisor();

    const patient = await given.a_random_patient();

    const editPatient = {...patient, info: chance.paragraph()};

    const response = await when.a_user_calls_editPaziente(authedUser, editPatient);

    expect(response).toBe(true);

});

test("Un Tutor tenta di modificare un paziente.", async () => {

    const authedUser = await given.an_authenticated_tutor();

    const patient = await given.a_random_patient();

    const editPatient = {...patient, info: chance.paragraph()};

    await expect(when.a_user_calls_editPaziente(authedUser, editPatient))
        .rejects
        .toThrow("Not Authorized to access editPaziente on type Mutation");

});

test("Viene modificato un paziente senza apportare nuove modifiche.", async () => {

    const authedUser = await given.an_authenticated_supervisor();

    const patient = await given.a_random_patient();

    await expect(when.a_user_calls_editPazienteM(authedUser, patient))
        .rejects
        .toThrow("Non sono state apportate modifiche.");

});