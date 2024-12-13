import { Chance } from "chance";
import * as given from "../../steps/given.mjs";
import * as when from "../../steps/when.mjs";
import * as then from "../../steps/then.mjs";
import { verifyAccessToken } from "../../steps/then.mjs";

const chance = new Chance();

test("Verifica che il report esiste su DynamoDB", async () => {
    const authedUser = await given.an_authenticated_supervisor();

    const {sub} = await verifyAccessToken(authedUser.accessToken)

    const pazienteId = await given.a_random_my_patient(sub);
    const newReport = given.a_new_report(sub,pazienteId);
    
    const event = {
        arguments: {
            newReport
        }
    }
 
    const response = await when.we_invoke_createNewReport(event);

    const { reportId } = response; 
    
    const reportExists = await then.report_exists_in_ReportsTable(pazienteId,reportId);
    
    expect(reportExists.result).toBe(true);
 
}, 10000);
