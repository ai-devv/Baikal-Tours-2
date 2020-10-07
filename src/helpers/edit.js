import { parseDate } from "/helpers/parsers.js";

export {
    getIds,
    parseDataToIds,
    getNamesById,
    cloneArray,
    formatDates,
    formatLocations,
    setDataToCK,
    formatIdsArrays,
    validateEditArray,
    validateEditData,
    validateNewData,
    validateNewtranslateData,
    setTextTranslation,
    validateActionData,
    parseTickets,
    formatArrays,
    getRundomObjects,
    formatStringArrays,
    getLocationNameById
}

function getIds(obj) {
    let data = null;
    if (obj !== null) {
        data = []
        for (let subject of obj)
            data.push(subject.id)
    }

    return data;
}

function parseDataToIds(obj, id) {
    if (obj !== null) {
        if (obj.indexOf(id) === -1) obj.push(id);
        else obj.splice(obj.indexOf(id), 1);

        if (obj.length === 0) obj = null;
        else
            obj = obj.sort(function (a, b) {
                return a - b;
            });
    } else obj = [id];

    return obj;
}

function getNamesById(namesObj, idObj) {
    let second = 0, data = [];

    if (idObj.length > 0) {
        for (let obj of namesObj) {

            for (let j = second; j < idObj.length; j++) {
                if (obj.id === idObj[j]) {
                    data.push(obj.name)
                    second = j + 1;
                    break;
                }
            }
            if (idObj.length === data.length)
                break;
        }
    }

    return data;
}

function cloneArray(arr) {
    let data = arr;
    if (data !== null) {
        data = Object.assign([], data);

        for (let i = 0; i < data.length; i++) {
            if (Array.isArray(data[i]))
                data[i] = Object.assign([], data[i])
            else if (typeof data[i] === "object")
                data[i] = Object.assign({}, data[i])
        }
    }

    return data;
}

function formatDates(dates, actionData) {
    let keys;
    let data = [];
    let newData = {
        create: [],
        edit: [],
        del: []
    };

    for (let i = 0; i < dates.length; i++) {
        let date = Object.assign({}, dates[i]);

        keys = Object.keys(date);

        if (keys[0] === "id") keys.splice(0, 1);

        let bl = false;
        for (let key of keys) {
            if (date[key] !== null && date[key].length === 0) {
                date[key] = null;
            }
            if (date[key] !== null) {
                bl = true;
            }
        }

        if (bl) {
            if (date.timeStart !== null && date.timeStart.split(":").length === 2)
                date.timeStart += ":00";

            if (date.timeEnd !== null && date.timeEnd.split(":").length === 2)
                date.timeEnd += ":00";

            data.push(date);
        }
    }

    if (actionData.dates !== null) {
        for (let i = 0; i < actionData.dates.length; i++) {
            let date = actionData.dates[i];
            let bl = true;

            for (let j = 0; j < data.length; j++) {
                if (date.id === data[j].id) {
                    bl = false;
                    break;
                }
            }

            if (bl) {
                newData.del.push(date.id);
            }
        }

        for (let i = 0; i < actionData.dates.length; i++) {
            let startData = actionData.dates[i];
            for (let j = 0; j < data.length; j++) {
                let editData = data[j]
                if (editData.id === startData.id) {
                    let keys = Object.keys(startData);
                    if(startData.dateStart) startData.dateStart = parseDate(new Date(startData.dateStart))
                    if(startData.dateEnd) startData.dateEnd = parseDate(new Date(startData.dateEnd))
                    startData.dateEnd = parseDate(new Date(startData.dateEnd))
                    for (let key of keys) {
                        if (startData[key] !== editData[key]) {
                            newData.edit.push(editData);
                            break;
                        }
                    }
                }
            }
        }
    }

    for (let i = 0; i < data.length; i++)
        if (data[i].id === undefined)
            newData.create.push(data[i]);

    if (newData.del.length === 0) delete newData.del;
    if (newData.create.length === 0) delete newData.create;
    if (newData.edit.length === 0) delete newData.edit;

    return newData;
}

function formatLocations(locations, actionData) {
    let keys,
        data = [],
        newData = {
            create: [],
            edit: [],
            del: []
        }

    for (let i = 0; i < locations.length; i++) {
        let location = Object.assign({}, locations[i]);

        location.locationId = location.location_id;
        delete location.location_id;

        keys = Object.keys(location);

        let bl = false;
        for (let key of keys) {
            if (location[key] === "")
                location[key] = null;
            if (location[key])
                bl = true;
        }

        if (bl)
            data.push(location)
    }

    if (actionData.locations !== null) {
        for (let i = 0; i < actionData.locations.length; i++) {
            let location = actionData.locations[i]
            let bl = true;
            for (let j = 0; j < data.length; j++) {
                if (location.id === data[j].id) {
                    bl = false;
                    break;
                }
            }

            if (bl)
                newData.del.push(location.id);
        }

        for (let i = 0; i < actionData.locations.length; i++) {
            let startLocation = actionData.locations[i]
            for (let j = 0; j < data.length; j++) {
                let editLocation = Object.assign({}, data[j]);
                if (startLocation.id === editLocation.id) {
                    let bl = false;

                    for (let key of Object.keys(editLocation))
                        if (editLocation[key] !== startLocation[key] && key !== "locationId")
                            bl = true;
                        else if (key !== "id" && key !== "locationId")
                            delete editLocation[key];

                    if (editLocation.locationId !== startLocation.location_id) bl = true;
                    else delete editLocation.locationId;

                    if (bl) {
                        editLocation.actionLocationId = editLocation.id;
                        delete editLocation.id;
                        newData.edit.push(editLocation);
                    }

                }
            }
        }
    }

    for (let i = 0; i < data.length; i++) {
        let location = data[i];
        if (!location.id) {
            delete location.id;
            if (location.locationId) {
                if (!location.address) delete location.address;
                newData.create.push(location)
            }
        }
    }

    if (newData.del.length === 0) delete newData.del;
    if (newData.create.length === 0) delete newData.create;
    if (newData.edit.length === 0) delete newData.edit;

    return newData;
}

function formatIdsArrays(newObj, oldObj) {
    let newData = {
        create: [],
        del: []
    }

    if (oldObj !== null && oldObj !== undefined) {
        for (let startId of oldObj) {
            let bl = true;
            for (let newId of newObj) {
                if (startId.id === newId) {
                    bl = false;
                    break;
                }
            }
            if (bl)
                newData.del.push(startId.id);
        }
    }

    if (newObj.length !== 0) {
        for (let newId of newObj) {
            let bl = true;
            if (oldObj !== null && oldObj !== undefined) {
                for (let startId of oldObj) {
                    if (newId === startId.id) {
                        bl = false;
                        break;
                    }
                }
            }
            if (bl)
                newData.create.push(newId)
        }
    }

    if (newData.del.length === 0) delete newData.del;
    if (newData.create.length === 0) delete newData.create;

    return newData;
}

function setDataToCK(data) {
    for (let i = 0; i < data.length; i++) {
        data[i] = Object.assign({}, data[i]);
        let keys = Object.keys(data[i]);

        for (let key of keys) {
            let oldKey = key;
            key = key.split("_")
            if (key.length > 1) {
                for (let j = 1; j < key.length; j++) {
                    let splitKey = key[j].split("");
                    splitKey[0] = splitKey[0].toUpperCase();
                    key[j] = splitKey.join("");
                }
            }
            key = key.join("");
            if (oldKey !== key) {
                data[i][key] = data[i][oldKey];
                delete data[i][oldKey];
            }
        }
    }

    return data;
}

function validateEditArray(newObj, oldObj, key, newData) {
    newObj = Object.assign(!Array.isArray(newObj) ? {} : [], newObj);

    let obj = newObj;
    if (!Array.isArray(newObj))
        obj = newObj.source;

    let newObjArr = []
    for (let i = 0; i < obj.length; i++) {
        if (obj[i] === "" || obj[i] === null) {
            obj.splice(i, 1);
            i--;
        } else {
            newObjArr.push(obj[i]);
        }
    }

    let formatOldObj = (oldObj === null || oldObj === undefined) ? "" : oldObj.join(";")

    if (newObjArr.join(";") !== formatOldObj) {
        if (newObjArr.length === 0)
            newObj = null;
        newData[key] = newObj;
    }
    else if (newData[key] !== undefined) delete newData[key];

    return newData;
}

function validateNewtranslateData(newObj, oldObj, key, newData) {
    if (oldObj !== newObj.text)
        newData[key] = newObj;
    else if (newData[key] !== undefined) delete newData[key];

    return newData;
}

function setTextTranslation(text, locale, actionId, forcibyTranslate) {

    let locales = ["ru", "en", "zh"];
    let data = {
        locale: "ru",
        autoTranslate: Boolean(!(Boolean(actionId)) || forcibyTranslate),
        toLocales: locales.filter(el => el !== locale)
    };

    if (Array.isArray(text)) data.source = text;
    else data.text = text;

    return data;
}

function validateNewData(newObj, oldObj, key, newData) {
    if (oldObj !== newObj)
        newData[key] = newObj;
    else if (newData[key] !== undefined) delete newData[key];

    return newData;
}

function validateEditData(obj, key, newData) {
    if (Object.keys(obj).length !== 0) {
        newData[key] = obj;
    } else if (newData[key] !== undefined) delete newData[key];

    return newData;
}

function validateActionData(newObj, oldObj) {
    let newData = {
        create: [],
        edit: [],
        del: []
    }

    if (oldObj !== null && oldObj.length > 0) {
        //Удаление
        for (let i = 0; i < oldObj.length; i++) {
            let find = false;
            for (let j = 0; j < newObj.length; j++) {
                if (oldObj[i].id === newObj[j].actionId) {
                    find = true;
                    break;
                }
            }
            if (!find) {
                newData.del.push(oldObj[i].id)
            }
        }

        //Редактирование
        for (let i = 0; i < oldObj.length; i++) {
            for (let j = 0; j < newObj.length; j++) {
                if (newObj[j].actionId === oldObj[i].id && newObj[j].description.text !== oldObj[i].description) {
                    newData.edit.push(newObj[j])
                    break;
                }
            }
        }
    }

    //Добавление
    for (let i = 0; i < newObj.length; i++) {
        let find = false;
        for (let j = 0; j < oldObj.length; j++) {
            if (newObj[i].actionId === oldObj[j].id) {
                find = true;
                break;
            }
        }
        if (!find)
            newData.create.push(newObj[i])
    }

    if (newData.del.length === 0) delete newData.del;
    if (newData.create.length === 0) delete newData.create;
    if (newData.edit.length === 0) delete newData.edit;

    return newData;
}

function parseTickets(oldTickets, newTickets, id, locale) {
    let newData = {
        edit: [],
        create: [],
        del: [],
    };

    for (let ticket of newTickets)
        if (ticket.price.length !== 0)
            ticket.price = Number(ticket.price);

    for (let ticket of newTickets) {
        if (ticket.id === undefined && ticket.name.length !== 0 && ticket.price.length !== 0) {
            ticket.name = setTextTranslation(ticket.name, locale, id, true);
            newData.create.push(ticket)
        }
    }

    for (let ticket of oldTickets) {
        let bl = false;
        for (let newTicket of newTickets) {
            if (ticket.id === newTicket.id) {
                bl = true;
                break;
            }
        }
        if (!bl)
            newData.del.push(ticket.id);
    }

    for (let newTicket of newTickets) {
        let data = {};
        for (let oldTicket of oldTickets) {
            if (oldTicket.id === newTicket.id) {
                if (newTicket.name !== oldTicket.name && newTicket.name.length !== 0)
                    data.name = setTextTranslation(newTicket.name, locale, id);

                if (newTicket.price !== oldTicket.price && newTicket.price.length !== 0)
                    data.price = newTicket.price;

                break;
            }
        }

        if (Object.keys(data).length !== 0) {
            data.id = newTicket.id;
            newData.edit.push(data);
        }
    }

    if (newData.create.length === 0) delete newData.create;
    if (newData.edit.length === 0) delete newData.edit;
    if (newData.del.length === 0) delete newData.del;

     (newData)

    return newData;
}

function formatArrays(newArr, oldArr, key, obj) {
    let newData = {
        create: [],
        del: []
    }

    if (newArr) {
        for (let el of newArr) {
            let bl = true;
            if (oldArr) {
                for (let oldEl of oldArr) {
                    if (el === oldEl) {
                        bl = false;
                        break;
                    }
                }
            }
            if (bl)
                newData.create.push(el);
        }
    }

    if (oldArr) {
        for (let el of oldArr) {
            let bl = true;
            if (newArr) {
                for (let newEl of newArr) {
                    if (el === newEl) {
                        bl = false;
                        break;
                    }
                }
            }
            if (bl)
                newData.del.push(el);
        }
    }

    if (!newData.create.length) delete newData.create;
    if (!newData.del.length) delete newData.del;

    obj[key] = newData;

    return obj;
}

function getRundomObjects(start, max, obj) {
    let randObjs = [];
        for (let i = start; i < max; i++) {
            if (!obj.length)
                break;
            let rand = parseInt(Math.random() * obj.length);
            randObjs.push(obj[rand]);
            obj.splice(rand, 1);
        }

    return randObjs;
}

function formatStringArrays(newObj, oldObj, locale){
    let data = {
        create: [],
        edit: [],
        delete: []
    }

    newObj = newObj.map(el => {
        return Object.assign({}, el);
    });
    oldObj = oldObj.map(el => {
        return Object.assign({}, el);
    });

    for(let obj of newObj)
        if(!obj.id && obj.name.length){
            obj.name = setTextTranslation(obj.name, locale, false);
            data.create.push(obj)
        }
    
    for(let oldj of oldObj){
        let bl = true;
        for(let newj of newObj)
            if(oldj.id === newj.id && newj.name.length){
                bl = false;
                break;
            }
        if(bl)
            data.delete.push(oldj.id)
    }

    for(let newj of newObj){
        let edit = {};
        for(let oldj of oldObj){
            if(oldj.id === newj.id && newj.name.length){
                let keys = Object.keys(oldj).filter(el => el !== "id");

                for(let key of keys){
                    if(oldj[key] !== newj[key])
                        edit[key] = newj[key];
                }

                if(edit.name) edit.name = setTextTranslation(newj.name, locale, true)
            }
        }

        if(Object.keys(edit).length)
            data.edit.push({id: newj.id, ...edit})
    }

    return data;
}

function getLocationNameById(locations, id){
    for(let location of locations)
        if(location.id === id)
            return location.name;
    return "";
}