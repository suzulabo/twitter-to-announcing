import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';

export type FirebaseAdminApp = admin.app.App;
export type Firestore = admin.firestore.Firestore;
export type HttpRequest = functions.Request;
export type HttpResponse = functions.Response;
