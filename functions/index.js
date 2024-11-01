const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendStatusUpdateNotification = functions.firestore
    .document("repairs/{repairId}")
    .onUpdate((change, context) => {
      const newValue = change.after.data();
      const previousValue = change.before.data();

      if (newValue.status !== previousValue.status) {
        const payload = {
          notification: {
            title: `Cập nhật trạng thái xe ${newValue.carName}`,
            body: `Trạng thái mới: ${newValue.status}`,
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
          },
          data: {
            carId: context.params.repairId,
            status: newValue.status,
            carName: newValue.carName,
          },
        };

        return admin
            .firestore()
            .collection("users")
            .doc(newValue.uid)
            .get()
            .then((userDoc) => {
              const userToken = userDoc.data().fcmToken;
              if (userToken) {
                return admin.messaging().sendToDevice(userToken, payload);
              }
              return null;
            })
            .catch((err) => {
              console.error("Error sending notification:", err);
            });
      }

      return null;
    });
