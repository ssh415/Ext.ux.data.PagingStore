StartTest({
  alsoPreload: [
    '../../../../extjs-4.1.1/ux/data/PagingStore.js'
  ]
}, function(t) {

    Ext.define('Artist', {
        extend: 'Ext.data.Model',
        fields: [
            {name: 'name', type: 'string'},
            {name: 'genre',  type: 'string'}
        ]
    });

    var myStore = Ext.create('Ext.ux.data.PagingStore', {
        model: 'Artist',
        pageSize: 3,
	    lastOptions: {start: 0, limit: 3, page: 1},
	    proxy: {
			type: 'ajax',
			url: './ux/artist.json',
			reader: {
				type: 'json',
				root: 'rows'
			}
		}
    });

	var rec, recs;

	t.chain(
		{
			action: function(next) {
				myStore.load();
				next();
			}
		},
		{
			action: function(next) {
				t.waitForStoresToLoad(myStore, next);
			}
		},
		{
			action: function(next) {
				t.ok(myStore.data, 'data populated');
				t.ok(myStore.allData, 'allData populated');

				t.is(myStore.data.length, 3, 'Store is paged');
				t.is(myStore.allData.length, 10, 'All data is there');
				t.is(myStore.getTotalCount(), 10, 'Total count looks at allData');

				rec = myStore.last();
				t.is(rec.get('name'), 'Lucious Jackson', '3rd record');

				myStore.nextPage();
				next();
			}
		},
		{
			action: function(next) {
				setTimeout(next, 50);
			}
		},
		{
			action: function(next) {
				console.log('testing after next');

				t.is(myStore.data.length, 3, 'Store is paged');
				t.is(myStore.allData.length, 10, 'All data is there');

				rec = myStore.last();
				t.is(rec.get('name'), 'Atlas Genius', '3rd record');

				myStore.add([
					['Lumineers', 'Rock'],
					['Stan Getz', 'Jazz']
				]);

				t.is(myStore.data.length, 5, 'Records added to current page');
				t.is(myStore.getCount(), 5, 'Records via count');
				t.is(myStore.allData.length, 12, 'All data is there');
				t.is(myStore.getTotalCount(), 12, 'Records via getTotalCount');

				recs = myStore.getModifiedRecords();
				t.is(recs.length, 2, '2 modified records');

				myStore.sort('name', 'ASC');
				t.is(myStore.currentPage, 2, 'Current page is still 2');
				t.is(myStore.data.length, 3, '3 records on current page');
				t.is(myStore.allData.length, 12, 'All data is there');
				rec = myStore.first();
				t.is(rec.get('name'), 'Jack Johnson', 'sorted first record on page 2');

				myStore.filter('genre', 'Rock');
				t.is(myStore.data.length, 3, '3 records on current page');
				t.is(myStore.allData.length, 8, '8 recs left in filter');

				myStore.clearFilter();
				t.is(myStore.data.length, 3, '3 records on current page');
				t.is(myStore.allData.length, 12, 'All data is there');

				rec = myStore.findRecord('name', 'Jack Johnson');
				myStore.remove(rec);
				t.is(myStore.data.length, 2, 'Records added to current page');
				t.is(myStore.getCount(), 2, 'Records via count');
				t.is(myStore.allData.length, 11, 'All data is there');
				t.is(myStore.getTotalCount(), 11, 'Records via getTotalCount');

				myStore.removeAll();
				t.is(myStore.data.length, 0, 'Current page records removed');
				t.is(myStore.getCount(), 0, 'Records via count');
				t.is(myStore.allData.length, 0, 'All records removed');
				t.is(myStore.getTotalCount(), 0, 'Records via getTotalCount');

				next();
			}
		},
		{
			action: function(next) {
				// Clear out sorters from above before loading and go back to
				// page 1
				myStore.sorters.clear();
				myStore.load({
					start: 0,
					params: {
						foo: 'bar'
					}
				});
				next();
			}
		},
		{
			action: function(next) {
				t.waitForStoresToLoad(myStore, next);
			}
		},
		{
			action: function(next) {
				t.is(myStore.data.length, 3, 'Store is paged after 2nd load');
				t.is(myStore.allData.length, 10, 'All data is there');
				t.is(myStore.getTotalCount(), 10, 'Total count looks at allData');

				rec = myStore.last();
				t.is(rec.get('name'), 'Lucious Jackson', '3rd record');

				myStore.removeAll();
				t.is(myStore.data.length, 0, 'Current page records removed');
				t.is(myStore.getCount(), 0, 'Records via count');
				t.is(myStore.allData.length, 0, 'All records removed');
				t.is(myStore.getTotalCount(), 0, 'Records via getTotalCount');
				next();
			}
		}
	);
});