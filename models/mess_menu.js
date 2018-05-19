const connection=require('./mysql_connection.js');

const TableStructure=`
CREATE TABLE IF NOT EXISTS MESS_MENU(
    hid INT NOT NULL AUTO_INCREMENT,
    day INT NOT NULL,
    breakfast char(100) NOT NULL,
    lunch char(100) NOT NULL,
    evening char(100) NOT NULL,
    dinner char(100) NOT NULL,
    PRIMARY KEY(hid,day),
    CONSTRAINT CHECK(day>=0 AND day<7)
)
`;

const createMessMenu=(hid,callback)=>
{   
    var createMessMenuQuery="";

    var pin=0;
    for(var i=0;i<7;++i)
    {
        var cur=`INSERT INTO MESS_MENU VALUES(${hid},${i},\"\",\"\",\"\",\"\");`
        connection.query(cur,(err,res)=>
        {
            ++pin;
            if(pin==7)
            {
                return callback(undefined,true);
            }
        });
    }   
}

const updateMessMenu=(hid,messMenu,callback)=>
{
    if(hid===undefined)
        return callback("HID NOT PROVIDED");
    var pin=0;
    for(var i=0;i<7;++i)
    {
        var updateMessMenuDay=`
            UPDATE MESS_MENU SET breakfast=\'${messMenu[i].breakfast}\',
            lunch=\'${messMenu[i].lunch}\',
            evening=\'${messMenu[i].evening}\',
            dinner=\'${messMenu[i].dinner}\' WHERE hid=${hid} AND day=${i}; 
        `;
        connection.query(updateMessMenuDay,(err,res)=>
        {
            if(err)
                return callback(callback(err));
            ++pin;
            if(pin==7)
            {
                return callback(undefined,true);
            }
        });
    }
}

const getMessMenu=(hid,callback)=>
{
    if(hid===undefined)
        return callback("HID NOT PROVIDED");
    const getMessMenuQuery=`SELECT breakfast,lunch,evening,dinner FROM MESS_MENU WHERE hid=${hid} ORDER BY day`;
    connection.query(getMessMenuQuery,(err,messMenuRet)=>
    {
        if(err)
        {
            console.log("error in get mess messMenu");
            return callback(err);
        }
        return callback(undefined,messMenuRet);
    });
}



module.exports={
    createMessMenu,
    getMessMenu,
    updateMessMenu
}