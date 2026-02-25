/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { WakeUpController } from './controllers/wakeUpController';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PlantController } from './controllers/plantsController';
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';



// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "Maybe_string_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_number_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"double"},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LocationSource": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["custom"]},{"dataType":"enum","enums":["search"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SearchRecordStatus": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["COMPLETE"]},{"dataType":"enum","enums":["READY"]},{"dataType":"enum","enums":["SCRAPING"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_SearchRecordDocument.Exclude_keyofSearchRecordDocument._id__": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"taxonKeys":{"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"double"}},{"dataType":"undefined"}]},"__typename":{"dataType":"union","subSchemas":[{"dataType":"enum","enums":["SearchRecord"]},{"dataType":"undefined"}]},"boundingPolyCoords":{"dataType":"array","array":{"dataType":"array","array":{"dataType":"array","array":{"dataType":"double"}}},"required":true},"commonName":{"dataType":"union","subSchemas":[{"ref":"Maybe_string_"},{"dataType":"undefined"}]},"createdTimestamp":{"dataType":"double","required":true},"lastRanTimestamp":{"dataType":"union","subSchemas":[{"ref":"Maybe_number_"},{"dataType":"undefined"}]},"locationName":{"dataType":"string","required":true},"locationSource":{"ref":"LocationSource","required":true},"occurrencesOffset":{"dataType":"double","required":true},"scientificName":{"dataType":"union","subSchemas":[{"ref":"Maybe_string_"},{"dataType":"undefined"}]},"status":{"ref":"SearchRecordStatus","required":true},"totalOccurrences":{"dataType":"double","required":true}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Omit_SearchRecordDocument._id_": {
        "dataType": "refAlias",
        "type": {"ref":"Pick_SearchRecordDocument.Exclude_keyofSearchRecordDocument._id__","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SearchRecordSummary": {
        "dataType": "refAlias",
        "type": {"dataType":"intersection","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"id":{"dataType":"string","required":true}}},{"ref":"Omit_SearchRecordDocument._id_"}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Pick_SearchRecordDocument.locationName-or-locationSource-or-boundingPolyCoords-or-commonName-or-scientificName_": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"boundingPolyCoords":{"dataType":"array","array":{"dataType":"array","array":{"dataType":"array","array":{"dataType":"double"}}},"required":true},"commonName":{"dataType":"union","subSchemas":[{"ref":"Maybe_string_"},{"dataType":"undefined"}]},"locationName":{"dataType":"string","required":true},"locationSource":{"ref":"LocationSource","required":true},"scientificName":{"dataType":"union","subSchemas":[{"ref":"Maybe_string_"},{"dataType":"undefined"}]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlantSearchParams": {
        "dataType": "refAlias",
        "type": {"ref":"Pick_SearchRecordDocument.locationName-or-locationSource-or-boundingPolyCoords-or-commonName-or-scientificName_","validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_string-Array_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"string"}},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "Maybe_number-Array_": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"double"}},{"dataType":"enum","enums":[null]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PlantArrayValuesDocument": {
        "dataType": "refAlias",
        "type": {"dataType":"nestedObjectLiteral","nestedProperties":{"bloomColors":{"dataType":"union","subSchemas":[{"ref":"Maybe_string-Array_"},{"dataType":"undefined"}]},"bloomTimes":{"dataType":"union","subSchemas":[{"ref":"Maybe_string-Array_"},{"dataType":"undefined"}]},"hardiness":{"dataType":"union","subSchemas":[{"ref":"Maybe_number-Array_"},{"dataType":"undefined"}]},"lightLevels":{"dataType":"union","subSchemas":[{"ref":"Maybe_string-Array_"},{"dataType":"undefined"}]},"soilTypes":{"dataType":"union","subSchemas":[{"ref":"Maybe_string-Array_"},{"dataType":"undefined"}]}},"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################


    
        const argsWakeUpController_wakeUp: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.post('/wakeUp',
            ...(fetchMiddlewares<RequestHandler>(WakeUpController)),
            ...(fetchMiddlewares<RequestHandler>(WakeUpController.prototype.wakeUp)),

            async function WakeUpController_wakeUp(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsWakeUpController_wakeUp, request, response });

                const controller = new WakeUpController();

              await templateService.apiHandler({
                methodName: 'wakeUp',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPlantController_getSearchRecord: Record<string, TsoaRoute.ParameterSchema> = {
                plantSearch: {"in":"body","name":"plantSearch","required":true,"ref":"PlantSearchParams"},
                errorResponse: {"in":"res","name":"500","required":true,"dataType":"string"},
        };
        app.post('/plants/searchRecord',
            ...(fetchMiddlewares<RequestHandler>(PlantController)),
            ...(fetchMiddlewares<RequestHandler>(PlantController.prototype.getSearchRecord)),

            async function PlantController_getSearchRecord(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPlantController_getSearchRecord, request, response });

                const controller = new PlantController();

              await templateService.apiHandler({
                methodName: 'getSearchRecord',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPlantController_runSearch: Record<string, TsoaRoute.ParameterSchema> = {
                searchRecordId: {"in":"path","name":"searchRecordId","required":true,"dataType":"string"},
                errorResponse: {"in":"res","name":"500","required":true,"dataType":"string"},
        };
        app.get('/plants/runSearch/:searchRecordId',
            ...(fetchMiddlewares<RequestHandler>(PlantController)),
            ...(fetchMiddlewares<RequestHandler>(PlantController.prototype.runSearch)),

            async function PlantController_runSearch(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPlantController_runSearch, request, response });

                const controller = new PlantController();

              await templateService.apiHandler({
                methodName: 'runSearch',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPlantController_getFilterValues: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/plants/filterValues',
            ...(fetchMiddlewares<RequestHandler>(PlantController)),
            ...(fetchMiddlewares<RequestHandler>(PlantController.prototype.getFilterValues)),

            async function PlantController_getFilterValues(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPlantController_getFilterValues, request, response });

                const controller = new PlantController();

              await templateService.apiHandler({
                methodName: 'getFilterValues',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
