"use strict";

const docusign = require('docusign-esign');
const async = require('async');



const basePath = "https://demo.docusign.net/restapi";



const userInfo = {
    id: undefined,
    name: undefined
};



let integratorKey = "ex-key",
    email = "sfakeemailgmail.com",
    password = "fakepass",
    recipientName = userInfo.name,
    recipientEmail = "fakeemaila";  //using my own email to not spam users



const creds = JSON.stringify({
    Username: email,
    Password: password,
    IntegratorKey: integratorKey
});



module.exports = function(id, name, cb) {
    //validating parameters
    if (!id || !name) throw new Error("docusign.js:export: null id or name");

    //setting user info
    userInfo.id = id;
    userInfo.name = recipientName = name;

    //running docusign code
    async.waterfall([login, createAndSendEnvelopeWithEmbeddedRecipient, requestRecipientView, cb]);
};



// initialize the api client
var apiClient = new docusign.ApiClient();
apiClient.setBasePath(basePath);
apiClient.addDefaultHeader("X-DocuSign-Authentication", creds);
docusign.Configuration.default.setDefaultApiClient(apiClient);



function login (next) {
    // login call available off the AuthenticationApi
    var authApi = new docusign.AuthenticationApi();

    // login has some optional parameters we can set
    var loginOps = new authApi.LoginOptions();
    loginOps.setApiPassword("true");
    loginOps.setIncludeAccountIdGuid("true");
    authApi.login(loginOps, function (err, loginInfo, response) {
      if (err) {
        return next(err);
      }
      if (loginInfo) {
        // list of user account(s)
        // note that a given user may be a member of multiple accounts
        var loginAccounts = loginInfo.getLoginAccounts();
        next(null, loginAccounts);
      }
    });
}

function createAndSendEnvelopeWithEmbeddedRecipient (loginAccounts, next) {
    var fileBytes = null;
    try { //todo: text document
        var fs = require('fs'),
            path = require('path');
        // read file from a local directory
        fileBytes = fs.readFileSync(path.join(__dirname, "waiver.pdf")); //causes bad endpoint
    } catch (ex) {
        // handle error
        console.log("Exception: " + ex);
    }

    // create a new envelope object that we will manage the signature request through
    var envDef = new docusign.EnvelopeDefinition();
    envDef.setEmailSubject("Sign Event Waiver");

    // add a document to the envelope
    var doc = new docusign.Document();
    var base64Doc = new Buffer(fileBytes).toString('base64');
    doc.setDocumentBase64(base64Doc);
    doc.setName("Event Waiver");
    doc.setDocumentId("1");

    var docs = [];
    docs.push(doc);
    envDef.setDocuments(docs);

    // Add an embedded recipient to sign the document
    var signer = new docusign.Signer();
    signer.setName(recipientName);		//todo: use real value
    signer.setEmail(recipientEmail);
    signer.setRecipientId("1");
    signer.setClientUserId(userInfo.id);  // must set clientUserId to embed the recipient!

    // create a signHere tab somewhere on the document for the signer to sign
    // default unit of measurement is pixels, can be mms, cms, inches also
    var signHere = new docusign.SignHere(); //todo: place
    signHere.setDocumentId("1");
    signHere.setPageNumber("1");
    signHere.setRecipientId("1");
    signHere.setXPosition("100");
    signHere.setYPosition("175");

    // can have multiple tabs, so need to add to envelope as a single element list
    var signHereTabs = [];
    signHereTabs.push(signHere);
    var tabs = new docusign.Tabs();
    tabs.setSignHereTabs(signHereTabs);
    signer.setTabs(tabs);

    // configure the envelope's recipient(s)
    envDef.setRecipients(new docusign.Recipients());    
    envDef.getRecipients().setSigners([]);
    envDef.getRecipients().getSigners().push(signer);

    // set envelope status to "sent" so we can sign it. Otherwise it's placed in draft folder
    envDef.setStatus("sent");

    var envelopesApi = new docusign.EnvelopesApi();

    envelopesApi.createEnvelope(loginAccounts[0].accountId, envDef, null, function(error, envelopeSummary, response) {
        if (error) {
        	console.log(error);
            return next(error);
        }

        if (envelopeSummary) {
            next(null, envelopeSummary.envelopeId, loginAccounts);
        }
    });
  }

function requestRecipientView (envelopeId, loginAccounts, next) {
	// set where the recipient should be re-directed once they are done signing
	const returnUrl = "https://sdhacks16-a.herokuapp.com/exit"; //todo: domain name

	var recipientView = new docusign.RecipientViewRequest();
	recipientView.setReturnUrl(returnUrl);
	recipientView.setUserName(recipientName);	//todo: deal with
	recipientView.setEmail(recipientEmail);		//todo: deal with
	recipientView.setAuthenticationMethod("email");
	recipientView.setClientUserId(userInfo.id);  // must match the clientUserId used in step #2!

	var envelopesApi = new docusign.EnvelopesApi();
	envelopesApi.createRecipientView(loginAccounts[0].accountId, envelopeId, recipientView, function(error, viewUrl, response) {
	    if (error) {
	        return next(error);
	    }

	    if (viewUrl) {
            next(null, viewUrl.url);
	    }
	});
}
