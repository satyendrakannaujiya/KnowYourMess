const connection=require('./mysql_connection.js');

const TableStructure=`
CREATE TABLE IF NOT EXISTS NOTIFICATIONS(
    nid INT NOT NULL AUTO_INCREMENT,
    date DATE NOT NULL,
    uid char(10) NOT NULL,
    hid int NOT NULL,
    title char(40) NOT NULL,
    text char(200) NOT NULL,
    PRIMARY KEY(nid)
)
`;

const createNotification=(notificationDetails,callback)=>{
    if(notificationDetails===undefined)
    {
        return callback("notification details is undefined");
    }
    var createNotificationQuery=`INSERT INTO 
        NOTIFICATIONS(date,uid,hid,title,text)
        VALUES(
            \"${notificationDetails.date}\",
            \"${notificationDetails.uid}\",
            \"${notificationDetails.hid}\",
            \"${notificationDetails.title}\",
            \"${notificationDetails.text}\"
        );
    `;
    connection.query(createNotificationQuery,callback);
}

const getNotificationsByHid=(hid,callback)=>
{
    if(hid===undefined)
    {
        return callback("HID Not provided");
    }
    var getNotificationsByHidQuery=`
        SELECT nid,date,uid,hid,title,text FROM NOTIFICATIONS
        WHERE HID=${hid} OR HID=0;
    `;
    connection.query(getNotificationsByHidQuery,callback);
}

const getGlobalNotifications=(callback)=>
{
    var getGlobalNotificationsQuery=`
        SELECT nid,date,uid,hid,title,text FROM NOTIFICATIONS
        WHERE HID=0;
    `;
    connection.query(getGlobalNotificationsQuery,callback);
}

const removeNotificationByNid=(nid,callback)=>
{
    var removeNotificationByNidQuery=`
        DELETE FROM NOTIFICATIONS WHERE NID=${nid};
    `;
    connection.query(removeNotificationByNidQuery,callback);
}

module.exports={
    createNotification,
    getNotificationsByHid,
    getGlobalNotifications,
    removeNotificationByNid
}