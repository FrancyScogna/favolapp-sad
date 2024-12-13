import { Chance } from "chance";
import * as given from "../../steps/given.mjs";
import * as when from "../../steps/when.mjs";
import * as then from "../../steps/then.mjs";

const chance = new Chance();

test("Verifica che il paziente, le sessioni e l'associazione tutor-paziente esistono su DynamoDB", async () => {

    const newPaziente = await given.a_new_paziente();
    
    const event = {
        arguments: {
            newPaziente
        }
    }

    const response = await when.we_invoke_createNewPaziente(event);

    const { result, pazienteId, sessionsIds, tutorsIds } = response;

    const pazienteExists = await then.patient_exists_in_PazientiTable(pazienteId);

    const sessionsExists = await then.sessions_exists_in_SessionsTable(sessionsIds);

    const tutorPazienteExists = await then.items_exists_in_PazientiTutorTable(pazienteId, tutorsIds);
    
    expect(pazienteExists.result).toBe(true);
    expect(sessionsExists.result).toBe(true);
    expect(tutorPazienteExists.result).toBe(true);

});