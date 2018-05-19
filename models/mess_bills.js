const connection=require('./mysql_connection.js');

const TableStructure=`
CREATE TABLE IF NOT EXISTS MESSBILLS(
    hid INT NOT NULL,
    date DATE NOT NULL,
    file char(100) NOT NULL,
    price int NOT NULL,
    uid char(10) NOT NULL,
    PRIMARY KEY(hid,date)
)
`;

const createMessBill=(messBill,callback)=>
{
    if(messBill===undefined||messBill.hid===undefined||messBill.date===undefined)
    {
        callback("Error: Need more details to add bill");
        return;
    }

    const createMessBillQuery=`INSERT INTO MESSBILLS(uid,hid,date,file,price) VALUES(
        \"${messBill.uid}\",
        ${messBill.hid},
        \"${messBill.date}\",
        \"${messBill.file}\",
        ${messBill.price}
    )`;

    connection.query(createMessBillQuery,callback);
};

const getBillsByHid=(hid,callback)=>
{
    if(hid===undefined)
        return callback("HID not defined.");
    const getBillsByHidQuery=`
        SELECT * FROM MESSBILLS WHERE hid=${hid};
    `;
    connection.query(getBillsByHidQuery,callback);
};

const getBillsByHidAndMonth=(hid,month,callback)=>
{
    if(hid===undefined||month===undefined)
        return callback("Provide complete stuff");
    const getBillsByHidAndMonthQuery=`
        SELECT * FROM MESSBILLS where hid=${hid} and MONTH(date)=${month};
    `;
    connection.query(getBillsByHidAndMonthQuery,callback);
}

const deleteBillsByHidAndDate=(hid,date,callback)=>
{
    if(hid===undefined||date===undefined)
        return callback("Provide complete stuff");
    const deleteBillsByHidAndDateQuery=`
        DELETE FROM MESSBILLS where hid=${hid} and date=${date};
    `;
    connection.query(deleteBillsByHidAndDateQuery,callback);
}

const deleteBillsByHidAndFile=(hid,file,callback)=>
{
    if(hid===undefined||file===undefined)
        return callback("Provide complete stuff");
    const deleteBillsByHidAndDateQuery=`
        DELETE FROM MESSBILLS where hid=${hid} and file=\"${file}\";
    `;
    connection.query(deleteBillsByHidAndDateQuery,callback);
}

module.exports={
    createMessBill,
    getBillsByHid,
    getBillsByHidAndMonth,
    deleteBillsByHidAndDate,
    deleteBillsByHidAndFile
}