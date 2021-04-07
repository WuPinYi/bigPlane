const defaultFetchOptions = {
	credentials: 'same-origin',
	headers: {
		'Content-Type': 'application/json'
	}
}

const urlQueryObjectToString = (urlQueryObject) => {
	if (Object.keys(urlQueryObject).length == 0)
		return "";

	var queryString = "";

	for (var k in urlQueryObject)
		queryString += String(k) + String(urlQueryObject[k]) + '&';

	queryString.substr(0, queryString.length - 1);

	return "?" + encodeURIComponent(queryString);
}

class Query {
	path;
	options;

	constructor(_path, _options = {}) {
		this.path = _path;
		this.options = _options;

		this.get = this.get.bind(this);
		this.post = this.post.bind(this);
		this.put = this.put.bind(this);
		this.delete = this.delete.bind(this);
	}

	async get(urlQueryObject = {}, options = {}) {
		var targetPath = this.path + urlQueryObjectToString(urlQueryObject);

		var dummy = options.dummy || this.options.dummy; 
		if(dummy)
			return dummy;

		return fetch(targetPath, {
				...defaultFetchOptions,
				...this.options,
				...options,
				method: 'GET'
			})
			.then(response => response.json());
	}

	async post(body = {}, options = {}) {
		var dummy = options.dummy || this.options.dummy; 
		if(dummy)
			return dummy;

		return fetch(this.path, {
				...defaultFetchOptions,
				...this.options,
				...options,
				method: 'POST',
				body: JSON.stringify(body)
			})
			.then(response => response.json());
	}

	async put(body = {}, options = {}) {
		var dummy = options.dummy || this.options.dummy; 
		if(dummy)
			return dummy;

		return fetch(this.path, {
				...defaultFetchOptions,
				...this.options,
				...options,
				method: 'PUT',
				body: JSON.stringify(body)
			})
			.then(response => response.json());
	}

	async delete(urlQueryObject = {}, options = {}) {
		var targetPath = this.path + urlQueryObjectToString(urlQueryObject);

		var dummy = options.dummy || this.options.dummy; 
		if(dummy)
			return dummy;

		return fetch(targetPath, {
				...defaultFetchOptions,
				...this.options,
				...options,
				method: 'DELETE'
			})
			.then(response => response.json());
	}
}

module.exports = Query;