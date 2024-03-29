import { toast } from "react-toastify";

export var changeLoginState = state => ({
  type: "CHANGE_LOGIN_STATE",
  value: state
});

var updatePatientData = patientData => ({
  type: "UPDATE_PATIENT_DATA",
  value: patientData
});

export var updatePatientDataPatient = patient => (dispatch, getState) => {
  // assume that fn is called with patient which only has some fields populated that have changed values.
  var patientData = getState().patientData;
  if (patient.errors) {
    // something went wrong, show toast error
    toast.error(patient.message);
  } else {
    dispatch(
      updatePatientData({
        ...patientData,
        patient: { ...patientData.patient, ...patient }
      })
    );
  }
};

var clearPatientData = () => ({
  type: "CLEAR_PATIENT_DATA"
});

export var fetchPatientData = patientId => (dispatch, getState) => {
  if (getState().patientData.patientId != patientId)
    // clear patient data if its not the same patient
    dispatch(clearPatientData());
  fetch(`/api/patientData/${patientId}`, { credentials: "include" })
    .then(res => res.json())
    .then(res => dispatch(updatePatientData(res)));
};

export var refreshPatientScannedPrescriptions = () => (dispatch, getState) => {
  const patientData = getState().patientData;
  const { patientId } = patientData;
  if (!patientId) return; // can't do shit
  fetch(`/api/prescription/scanned/patient/${patientId}`, {
    credentials: "include"
  })
    .then(res => res.json())
    .then(scannedPrescriptions =>
      dispatch(updatePatientData({ ...patientData, scannedPrescriptions }))
    );
};

export var refreshPatientInvoices = () => (dispatch, getState) => {
  const patientData = getState().patientData;
  const { patientId } = patientData;
  if (!patientId) return; // can't do shit
  fetch(`/api/invoice/patient/${patientId}`, {
    credentials: "include"
  })
    .then(res => res.json())
    .then(invoices =>
      dispatch(updatePatientData({ ...patientData, invoices }))
    );
};

var updateTodaysVisits = todaysVisits => ({
  type: "UPDATE_TODAYS_VISITS",
  value: todaysVisits
});

var setFetchingTodaysVisits = value => ({
  type: "SET_FETCHING_TODAYS_VISITS",
  value: value
});

export var fetchTodaysVisits = () => dispatch => {
  dispatch(setFetchingTodaysVisits(true));
  fetch("/api/visit/today", {
    credentials: "include"
  })
    .then(res => res.json())
    .then(res => res.filter(({ patient }) => patient))
    .then(visits => {
      dispatch(setFetchingTodaysVisits(false));
      dispatch(updateTodaysVisits(visits));
    });
};
