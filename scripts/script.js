var list = document.getElementById('team-members-list')
var roleChecks = document.getElementById('roleChecks')
var filterForm = document.forms['filter-form']

var API_ROUTES = {
	FETCH_ALL_MEMBERS: 'http://sandbox.bittsdevelopment.com/code1/fetchemployees.php',
	FETCH_ALL_ROLES: 'http://sandbox.bittsdevelopment.com/code1/fetchroles.php',
	FETCH_EMPLOYEES_BY_ROLE: 'http://sandbox.bittsdevelopment.com/code1/fetchemployees.php?roles=',
}

// This (common) function will send get request to the url that's passed and returns a JSON object of response
var fetchFromAPI = function (url, callBack) {
	var xhttp = new XMLHttpRequest()
	xhttp.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			callBack(Object.values(JSON.parse(xhttp.responseText)))
		} else {
			callBack(null)
		}
	}
	xhttp.open('GET', url, true)
	xhttp.send()
}

// This (common) function will create member based on the member details thats passed
var createEmployee = function (memberDetails) {
	var htmlStr = ''
	htmlStr += `
		<div class="member-box">
			${memberDetails.isFeatured ? `<div class='crown-icon'>&#x1f451</div>` : ''}
			${memberDetails.hasPic ? `<img height="100" class="member-image" src='${memberDetails.userImage}'/>` : ''}
			<h3 class="member-fullName">${memberDetails.fullName}</h3>
			<p class="member-details">${memberDetails.employeeDescription}</p>
			<div class="member-roles">${memberDetails.empRoles
				.map(
					(role) => `	
					<div class="member-role" style="background-color:${role.rolecolor};">
						${role.rolename}
					</div>
				`
				)
				.join('')}</div>
		</div>
	`
	return htmlStr
}

// This (callback) function will process the fetched members data
var handleMembersResponse = function (allMembers) {
	if (allMembers) {
		var htmlStr = ''
		allMembers.forEach((member) => {
			var fullName = `${member.employeefname} ${member.employeelname}`
			var employeeDescription = member.employeebio
			var isFeatured = member.employeeisfeatured === '1'
			var hasPic = member.employeehaspic === '1'
			var empRoles = member.roles
			var userImage = `http://sandbox.bittsdevelopment.com/code1/employeepics/${member.employeeid}.jpg`

			var employeeDetails = {
				fullName: fullName,
				employeeDescription: employeeDescription,
				isFeatured: isFeatured,
				empRoles: empRoles,
				userImage: userImage,
				hasPic: hasPic,
			}
			htmlStr += createEmployee(employeeDetails)
		})
		list.innerHTML = htmlStr
	}
}

// This (callback) function will process the fetched roles data
var handleRolesResponse = function (allRoles) {
	var htmlStr = `
	<div class="form-group">
		<input type="checkbox" id="0" name="rolesCb" value="0">
		<label for="0">All</label>
	</div>
	`

	if (allRoles) {
		allRoles.forEach((role) => {
			htmlStr += `
			<div class="form-group">
				<input type="checkbox" id=${role.roleid} name="rolesCb" value=${role.roleid}>
				<label for=${role.roleid}>${role.rolename}</label><br>
			</div>
			`
		})
	}
	roleChecks.innerHTML = htmlStr
}

// function to handle the onsubmit event - search
filterForm.onsubmit = function () {
	// get all checkboxes
	var checkboxes = document.getElementsByName('rolesCb')
	var selectedCheckBoxes = []

	// get checked values
	for (var i = 0; i < checkboxes.length; i++) {
		if (checkboxes[i].checked) {
			selectedCheckBoxes.push(checkboxes[i].value)
		}
	}
	// if checkboxes checked fetch relavent data
	if (selectedCheckBoxes.length > 0) {
		var url = API_ROUTES.FETCH_EMPLOYEES_BY_ROLE + selectedCheckBoxes.join(',')

		// if all is selected fetch all results
		if (selectedCheckBoxes.indexOf('0') > -1) {
			url = API_ROUTES.FETCH_ALL_MEMBERS
		} else {
			// else fetch results based on roles
			url = API_ROUTES.FETCH_EMPLOYEES_BY_ROLE + selectedCheckBoxes.join(',')
		}
		fetchFromAPI(url, handleMembersResponse)
	} else {
		// no checkboxes checked, fetch all members
		fetchFromAPI(API_ROUTES.FETCH_ALL_MEMBERS, handleMembersResponse)
	}
	return false
}

// function to handle the onreset event - reset
filterForm.onreset = function () {
	// fetch all results
	fetchFromAPI(API_ROUTES.FETCH_ALL_MEMBERS, handleMembersResponse)
}

// fetch all roles
fetchFromAPI(API_ROUTES.FETCH_ALL_ROLES, handleRolesResponse)
// fetch all members
fetchFromAPI(API_ROUTES.FETCH_ALL_MEMBERS, handleMembersResponse)
