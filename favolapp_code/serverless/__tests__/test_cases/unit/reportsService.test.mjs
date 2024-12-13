import { Chance } from "chance";
import * as given from "../../steps/given.mjs";
import * as when from "../../steps/when.mjs";
import { verifyAccessToken } from "../../steps/then.mjs";

const chance = new Chance();

test("Un utente crea un nuovo report.", async () => {

    const authedUser = await given.an_authenticated_supervisor();

    const {sub} = await verifyAccessToken(authedUser.accessToken)

    const pazienteId = await given.a_random_my_patient(sub);

    const newReport = given.a_new_report(sub, pazienteId);

    const response = await when.a_user_calls_createNewReport(authedUser, newReport);

    expect(response).toBe(true);

});

test("Un utente prova a creare un report su un paziente non preso in carico.", async () => {

    const authedUser = await given.an_authenticated_tutor();

    const {sub} = await verifyAccessToken(authedUser.accessToken)

    const pazienteId = await given.a_random_not_my_patient(sub);

    const newReport = given.a_new_report(sub, pazienteId);

    await expect(when.a_user_calls_createNewReport(authedUser, newReport))
        .rejects
        .toThrow("Is not your patient.");

});

test("Un utente modifica un proprio report.", async () => {

    const authedUser = await given.an_authenticated_tutor();

    const {sub} = await verifyAccessToken(authedUser.accessToken)

    const report = await given.a_random_my_report(sub);

    const editReport = {...report, description: chance.paragraph()};

    const response = await when.a_user_calls_editReport(authedUser, editReport);

    expect(response.reportId).toBe(editReport.reportId);
    expect(response.description).toBe(editReport.description);
    expect(response.contenuto).toBe(editReport.contenuto);
});


test("Un utente prova a modificare un report non suo.", async () => {
    const authedUser = await given.an_authenticated_tutor();

    const {sub} = await verifyAccessToken(authedUser.accessToken)

    const report = await given.a_random_not_my_report(sub);

    const editReport = {...report, description: chance.paragraph()};
    
    await expect(when.a_user_calls_editReport(authedUser, editReport))
    .rejects
    .toThrow("Unauthorized: The report does not belong to the specified tutor.");
});

test("Un utente prova a modificare un proprio report con campi non validi.", async () => {

    const authedUser = await given.an_authenticated_tutor();

    const {sub} = await verifyAccessToken(authedUser.accessToken)

    const report = await given.a_random_my_report(sub);

    const editReport = {...report, description: ""};

    await expect(when.a_user_calls_editReport(authedUser, editReport))
        .rejects
        .toThrow("Missing required fields: reportId, description, contenuto");
});





