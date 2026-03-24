import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import List "mo:core/List";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

actor {
  type LocationEntry = {
    labelText : Text;
    lat : Float;
    lng : Float;
    timestamp : Int;
  };

  module LocationEntry {
    public func compare(l1 : LocationEntry, l2 : LocationEntry) : Order.Order {
      Int.compare(l2.timestamp, l1.timestamp);
    };
  };

  type LocationRequest = {
    labelText : Text;
    token : Text;
    creationTime : Int;
    entries : List.List<LocationEntry>;
  };

  // Persistent storage
  let locationRequests = Map.empty<Text, LocationRequest>();

  // Create new location request
  public shared ({ caller }) func createRequest(token : Text, labelText : Text) : async () {
    let _request : LocationRequest = {
      labelText;
      token;
      creationTime = Time.now();
      entries = List.empty();
    };
    locationRequests.add(token, _request);
  };

  // Submit location entry for token
  public shared ({ caller }) func submitLocation(token : Text, entryLabel : Text, lat : Float, lng : Float) : async Bool {
    switch (locationRequests.get(token)) {
      case (null) { false };
      case (?req) {
        let newEntry : LocationEntry = {
          labelText = entryLabel;
          lat;
          lng;
          timestamp = Time.now();
        };
        req.entries.add(newEntry);
        locationRequests.add(token, req);
        true;
      };
    };
  };

  // Get all entries for token
  public query ({ caller }) func getEntries(token : Text) : async [LocationEntry] {
    switch (locationRequests.get(token)) {
      case (null) { Runtime.trap("Token does not exist") };
      case (?req) {
        req.entries.toArray().sort();
      };
    };
  };
};
