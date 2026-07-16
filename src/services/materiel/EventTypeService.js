import Api from "/src/http/Request";

export default {
  getEvents() {
    return Api.api().get("/mat-perso-event-types");
  },
  addEvent(event) {
    return Api.api().post("/mat-perso-event-types", event);
  },
  updateEvent(event) {
    return Api.api().put(`/mat-perso-event-types/${event.id}`, event);
  },
  removeEvent(eventId) {
    return Api.api().delete(`/mat-perso-event-types/${eventId}`);
  },
};
