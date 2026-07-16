import Api from "/src/http/Request";

export default {
  addEvents(events) {
    return Api.api().post("/mat-perso-event", { events });
  },
  // updateEvent(event) {
  //   return Api.api().put(`/mat-perso-event-types/${event.id}`, event);
  // },
  // removeEvent(eventId) {
  //   return Api.api().delete(`/mat-perso-event-types/${eventId}`);
  // },
};
