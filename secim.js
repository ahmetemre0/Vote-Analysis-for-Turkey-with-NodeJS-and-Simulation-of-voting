const puppeteer = require('puppeteer');
const fs = require('fs');
const { Console } = require('console');
const { parse } = require('path');

(async () => {
    const browser = await puppeteer.launch();
    const data = await browser.newPage();
    await data.goto('https://www.haberturk.com/secim/secim2018/genel-secim/iller');
    const mv_counts = [15,5,6,4,3,36,17,2,8,9,2,3,3,3,3,20,4,2,4,7,12,4,5,2,6,6,14,4,2,3,11,4,13,98,28,3,3,10,3,2,14,15,5,6,10,8,6,7,3,3,3,6,3,8,9,3,2,5,8,5,6,1,14,3,8,4,5,4,1,3,3,5,4,2,2,2,3,3,2,4,3];
    const cities = ['adana','adıyaman','afyonkarahisar','ağrı','aksaray','amasya','ankara','antalya','ardahan','artvin','aydın','balıkesir','bartın','batman','bayburt','bilecik','bingöl','bitlis','bolu','burdur','bursa','çanakkale','çankırı','çorum','denizli','diyarbakır','düzce','edirne','elazığ', 'erzincan','erzurum','eskişehir','gaziantep','giresun','gümüşhane','hakkari','hatay','ığdır','ısparta','istanbul','izmir','kahramanmaraş','karabük','karaman','kars','kastamonu','kayseri','kilis','kırıkkale','kırklareli','kırşehir','kocaeli','konya','kütahya','malatya','manisa','mardin','mersin','muğla','muş','nevşehir','niğde','ordu','osmaniye','rize','sakarya','samsun','şanlıurfa','siirt','sinop','şırnak','sivas','tekirdağ','tokat','trabzon','tunceli','uşak','van','yalova','yozgat','zonguldak']
    const link_list = await data.$$eval('.bottom-list li', rows => 
    rows.map(row => {
        const element = row.querySelector('a');
        return element.getAttribute('href');
    })
        );
    //console.log(link_list);
    
    
    for(var i = 0; i < link_list.length; i++){
        await data.goto('https://www.haberturk.com/' + link_list[i]);

        const tableData = await data.$$eval('[class="gray red tables buyuksehir"] tbody tr', rows =>
            rows.map(row => {
                const columns = row.querySelectorAll('td');
                const columns_array = Array.from(columns, column => column.innerText);
                return columns_array
            })
        );
        //console.log(tableData);

        var dict = new Object();
        
        for (var j = 0; j < 5; j++) {
            tableData[j + 1][1] = tableData[j + 1][1].replace(/\./g, "");
            dict[tableData[j + 1][0]] = parseInt(tableData[j + 1][1]);
        }
        var keys = Object.keys(dict);
        sortedKeys = keys.sort();

        var old_chp_vote = dict['CHP'];
        var old_chp_seat = 100;
        var chp_vote_changes = 0;
        var seats = {};
        
        while(true)
        {   
            if ('CHP' in dict) {
                
            }
            else{
                chp_vote_changes = 1000000;
                break;
            }
            // Define the number of seats to allocate
            const numSeats = mv_counts[i];
            
            // Calculate the divisor for each party
            const divisors = {};
            seats = {};
            for (const party in dict) {
                seats[party] = 0;
                divisors[party] = 1;
            }
            
            // Allocate the seats using the modified D'Hondt method
            
            for (let i = 0; i < numSeats; i++) {
                let maxQuotient = 0;
                let winningParty;
                for (const party in dict) {
                const quotient = dict[party] / divisors[party];
                if (quotient > maxQuotient) {
                    maxQuotient = quotient;
                    winningParty = party;
                }
                }
                divisors[winningParty]++;
                seats[winningParty] = (seats[winningParty] || 0) + 1;
            }
            /*
            if(chp_vote_changes === 0){
                console.log('seats before vote changes for ' + cities[i])
                for (const party in seats) {
                    console.log(`${party}: ${seats[party]}`);
                }
            }
            */
            if(seats['CHP'] > old_chp_seat){
                break;
            }
            chp_vote_changes += 100;
            dict['CHP'] += 100;
            dict['AK Parti'] -= 100;
            old_chp_seat = seats['CHP']
            // Print the allocation of seats for each party
            
        }
        /*
        console.log('seats after ' + chp_vote_changes + ' vote changes in CHP for ' + cities[i])
        for (const party in seats) {
            console.log(`${party}: ${seats[party]}`);
        }
        */
        dict['AK Parti'] += chp_vote_changes
        dict['CHP'] = old_chp_vote
        var old_iyip_vote = dict['İYİ Parti'];
        var old_iyip_seat = 100;
        var iyip_vote_changes = 0;
        seats = {};

        while(true)
        {    
            if ('İYİ Parti' in dict) {
                
            }
            else{
                iyip_vote_changes = 1000000;
                break;
            }
            // Define the number of seats to allocate
            const numSeats = mv_counts[i];
            
            // Calculate the divisor for each party
            const divisors = {};
            seats = {};
            for (const party in dict) {
                seats[party] = 0;
                divisors[party] = 1;
            }
            
            // Allocate the seats using the modified D'Hondt method
            
            for (let i = 0; i < numSeats; i++) {
                let maxQuotient = 0;
                let winningParty;
                for (const party in dict) {
                const quotient = dict[party] / divisors[party];
                if (quotient > maxQuotient) {
                    maxQuotient = quotient;
                    winningParty = party;
                }
                }
                divisors[winningParty]++;
                seats[winningParty] = (seats[winningParty] || 0) + 1;
            }

            if(seats['İYİ Parti'] > old_iyip_seat){
                break;
            }
            iyip_vote_changes += 100;
            dict['İYİ Parti'] += 100;
            dict['AK Parti'] -= 100;
            old_iyip_seat = seats['İYİ Parti']
            // Print the allocation of seats for each party
            
        }

        /*
        console.log('seats after ' + iyip_vote_changes + ' vote changes in İYİ Parti for ' + cities[i])
        for (const party in seats) {
            console.log(`${party}: ${seats[party]}`);
        }
        */

        if(iyip_vote_changes > chp_vote_changes){
            console.log(cities[i] + ' şehrindeysen CHP')
        }
        else{
            console.log(cities[i] + ' şehrindeysen İYİ Parti')
        }
    }
    browser.close();
})();