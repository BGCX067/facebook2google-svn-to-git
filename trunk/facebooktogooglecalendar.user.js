// ==UserScript==
// @name Facebook to Google Calendar
// @namespace http://userscripts.org/scripts/show/8294
// @description Add your facebook events to cuurently logged in Google Calendar.
// @include http*://*.facebook.com/event.php?eid=*
//
//Version 2.1 
//
//Known issues:
//Not Tested With Full Day Events
// ==/UserScript==

(function() {

//Functions 
var GetDate = function(FullDate)
		{//Format the Date Monday, January 1, 2007 -> 20070101
			var DateBreakdown = FullDate.split(", ");
			var WeekDay = DateBreakdown[0];
			var Year = DateBreakdown[2];
			var MonthDay = DateBreakdown[1].split(" ");
			var MonthName = MonthDay[0];
			var Day = MonthDay[1];
			if (Day<10) {
				Day = "0" + Day; 
			}
		        var Month = Months[MonthName]; 
			return Year+ Month + Day;
		}

var GetTime = function(FullTime)
		{//Format the Time 1:30pm -> 133000
		
			var FullTime = FullTime.replace ("am",":am").replace ("pm",":pm");
		
			TimeBreakdown = FullTime.split(":");
			if (TimeBreakdown[0]==12) TimeBreakdown[0] = 0;
			//TODO: Fix this up, Can't we just concat the times together?
			//TODO: timezoneoffset can invalidate the time
			if (TimeBreakdown[2]=="pm")
			{
				Time = TimeBreakdown[0]*100 - timezoneoffset*100 + TimeBreakdown[1]*1 + 1200;
			} 
			else 
			{
				Time = TimeBreakdown[0]*100 - timezoneoffset*100 + TimeBreakdown[1]*1;
			}

			if (Time<10)Time = "000" + Time;
			else if (Time<100)Time = "00" + Time;
			else if (Time<1000)Time = "0" + Time;

			return Time;
		
		}



//The following is a value for correcting the time, if it differs between Facebook and GCal.  
//If you have UTC on, then you want to put your timezones offset from GMT here.
//If you have UTC off, as recommended, zero is probably what you want.
var UTC = "off";
var timezoneoffset=0;
var timetype="00";
if (UTC=="on")
{
    var timetype="00Z";
}


//Months Object
var  Months = 
	{ 
		"January": "01",
		"February": "02",
		"March": "03",
		"April": "04",
		"May": "05",
		"June": "06",
		"July": "07",
		"August": "08",
		"September": "09",
		"October": "10",
		"November": "11",
		"December": "12"
	};

var Information = document.getElementById('event').firstChild.getElementsByTagName('TD');
var FullDay=false;//Not Used at Present


//Get Event Information
var Name, Tagline, Host, Type, Date, Time;
var DateStart, DateFinish, TimeStart, TimeFinish;
var Tagline = '';
var Location = '';
var Street = '';
var City = '';
var Email = '';
var Phone = '';

for(var i=0; i<Information.length; i++)
{
	var InformationType = Information[i].textContent;
	var InformationData = '';
	if(Information[(i+1)])
	{//When a match is made, the next element is always the data
		InformationData = Information[(i+1)].textContent;
	}
	if (InformationType=="Name:")
	{
		Name = InformationData;
	}
	else if (InformationType=="Tagline:")
	{
		Tagline = "Tagline: " +  InformationData;
	}
	else if (InformationType=="Host:")
	{
		Host = "Hosted by: " + InformationData;
	}
	else if (InformationType=="Type:")
	{
		Type = InformationData;
	}
	else if (InformationType=="Date:")
	{
		FullDay=true;

		DateStart= GetDate(InformationData);
		DateFinish = DateStart;
	}
	else if (InformationType=="Time:")
	{
		var Time=InformationData;
		var Times = Time.split(" - ");

		TimeStart = GetTime(Times[0]);
		TimeFinish = GetTime(Times[1]);
	}
	if (InformationType=="Start Time:")
	{
		var FullStartDate=InformationData;
		var DateBreakdown = FullStartDate.split(" at ");

		DateStart = GetDate(DateBreakdown[0]);
		TimeStart = GetTime(DateBreakdown[1]);

		FullDay=false;
	}
	else if (InformationType=="End Time:")
	{
		var FullFinishDate=InformationData;
		var DateBreakdown = FullFinishDate.split(" at ");

		DateFinish = GetDate(DateBreakdown[0]);
		TimeFinish = GetTime(DateBreakdown[1]);
	}
	else if (InformationType=="Location:")
	{
		Location =  InformationData + ", "; 

	}
	else if (InformationType=="Street:")
	{
		Street =  InformationData + ", "; 
	}
	else if (InformationType=="City/Town:")
	{
		City =  InformationData;
	}
	else if (InformationType=="Email:")
	{
		Email =  InformationData;
	}
	else if (InformationType=="Phone:")
	{
		Phone =  InformationData;
	}


}

var DescriptionSearch = document.getElementById('event').firstChild.getElementsByTagName('DIV');
var Description = '';
for(var i=0; i<DescriptionSearch.length; i++)
{
	if(DescriptionSearch[i].className == 'box clearfix description')
	{
		String = DescriptionSearch[i].firstChild.nodeValue;
		Description = String;
	}	
}

  
Name = Name;
var FullDescription = Tagline + "\n" + Host + "\n" + Email + "\n" +  Phone + "\n" + Description;
FullDescription = encodeURIComponent(FullDescription);
var Address = Location + Street + City;
Address =  encodeURIComponent(Address);

finaldate = DateStart + "T" + TimeStart + timetype + "/" + DateFinish + "T" + TimeFinish + timetype;

var addtogcal = document.createElement("div");
var allLists = document.getElementsByTagName('UL');
var url = 'http://www.google.com/calendar/event' + '?action=TEMPLATE&text=' + Name + '&dates=' + finaldate + '&location=' + Address + '&pli=1&details=' + FullDescription;

addtogcal.innerHTML = '<div class="ical_section" style="margin-bottom:1em;float:left;clear:left;"><div class="ical_text"><a class="ical" target="_fbtogcal" href="'+url+'" class="tools">Add to GCal</a></div></div>';
for(var i = 0; i < allLists.length; i++)
{
	if(allLists[i].className=='actionspro')
	{
		allLists[i].parentNode.insertBefore(addtogcal, allLists[i].nextSibling.nextSibling.nextSibling.nextSibling);
	}
}

})();