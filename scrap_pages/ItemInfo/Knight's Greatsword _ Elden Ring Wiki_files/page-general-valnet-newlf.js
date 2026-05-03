//
// Content:
//			page-buttons.js
//			menu.js
//			comments.js
//			gx-generalv2.js
//
////var avatarUrl = '//fextralife.com/avatars/';
var avatarUrl = 'https://';
document.addEventListener("DOMContentLoaded", function () {
var dateVar = new Date();
var offset = dateVar.getTimezoneOffset();
document.cookie = "offset="+offset+";domain=.fextralife.com; path=/";

if (ua == '210' || ua == '211') {
	var menuAddA = document.getElementById('menu-add-a');
	if (menuAddA != null) {
		menuAddA.remove();
	}
	var menuAddB = document.getElementById('menu-add-b');
	if (menuAddB != null) {
		menuAddB.remove();
	}
}

if (ua!='100'&&ua!='110'&&ua!='210'&&ua!='111'&&ua!='211') {
	$('#join-vip-container').append('<p style="font-size: 13px;margin: 0px;" align="center"><a class="wiki-link" href="https://fextralife.com/be-a-vip/" style="color: #ab966f;">Join VIP to remove all ads and videos</a></p>');
}



//********************************************************************
// Page-Buttons
//********************************************************************
$('#dateModified').attr('datetime', pagex['ipDateModified']);
$('#dateModified').text('Updated: ' + pagex['dateModified']);

$(document).off('click', '#btnCreateBreadcrumb');
$(document).on('click', '#btnCreateBreadcrumb', function(e) {
	$('#sub-content-a').load('/wiki/private/page-breadcrumb.jsp', function(response, status, xhr) {
		if (status === 'error') {
			alert('Server is busy, please try later!');
			return;
		}
		$('#sub-content-a').show();
		$('#search-content').hide();
		$('#search-content').empty();
		$('#sub-content-b').hide();
		$('#sub-content-b').empty();
		$('#edition').hide();
		$('#edition').empty();
		$('#sub-main').hide();
		$('#page-action-button-container').removeClass('open');
		$('#btnPageAction').attr('aria-expanded', false);
		$('#btnPageAction').hide();
		document.documentElement.scrollTop = 0;
	});
	return false;
});
$(document).off('click', '#btnUpdateBreadcrumb');
$(document).on('click', '#btnUpdateBreadcrumb', function(e) {
	showWindow();
	pagex['breadcrumb-param-id'] = pagex['pageId'];
	$('#sub-content-a').load('/wiki/private/page-breadcrumb.jsp');
	$('#sub-content-a').show();
	if ($('#edition').length) {
		if ($('#edition').attr('data-type') == 'template') {
			$('#edition').hide();
		}
	}
	return false;
});
$(document).off('click', '#btnUserProfile');
$(document).on('click', '#btnUserProfile', function(e) {
	showWindow();
	$('#sub-content-a').load('/common/user-profile.jsp');
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnPageEdit');
$(document).on('click', '#btnPageEdit', function(e) {
console.log('edit a1');
	showWindow();
	$('#edition').load('/wiki/editor/page-editor.jsp');
	$('#edition').show();
	$('#btnPageEditorSave').removeAttr('disabled');
	return false;
});
$(document).off('click', '.btnEditPage');
$(document).on('click', '.btnEditPage', function(e) {
console.log('edit a2');
	var obuttonPageEdit = $(this);
	obuttonPageEdit.prop('disabled', true);
	var pageId = $('#main-content').attr('data-pid');
	pagex['editor-page-id'] = pageId;
	$('#edition').load('/ws/weditor/page/' + pageId, function(response, status, xhr) {
		if (status === 'error') {
			alert('Server is busy, please try later!');
			obuttonPageEdit.prop('disabled', false);
			return;
		}
		$('#search-content').hide();
		$('#search-content').empty();
		$('#sub-content-a').hide();
		$('#sub-content-a').empty();
		$('#sub-content-b').hide();
		$('#sub-content-b').empty();
		$('#edition').hide();
		$('#sub-main').hide();
		$('#page-action-button-container').removeClass('open');
		$('#btnPageAction').attr('aria-expanded', false);
		$('#btnPageAction').hide();

		$('#edition').show();
		$('#btnPageEditorSave').removeAttr('disabled');
		$('#page-buttons-section').hide();
		$('#breadcrumbs-section').hide();
		document.documentElement.scrollTop = 0;
		obuttonPageEdit.prop('disabled', false);
	});
	return false;
});
$(document).off('click', '#btnPageRename');
$(document).on('click', '#btnPageRename', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/wiki/private/page-rename.jsp');
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnPageRedirect');
$(document).on('click', '#btnPageRedirect', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/wiki/private/page-redirect.jsp');
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnEditOpenGraph');
$(document).on('click', '#btnEditOpenGraph', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/ws/pagemanager/open-graph-editor/' + pagex['pageId']);
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnCommentsApproval');
$(document).on('click', '#btnCommentsApproval', function(e) {
	window.location.href = '/wiki/comments-approval';
	return false;
});
$(document).off('click', '#btnWikiManager');
$(document).on('click', '#btnWikiManager', function(e) {
	window.location.href = '/wiki/manager';
	return false;
});
$(document).off('click', '#btnFlagPage');
$(document).on('click', '#btnFlagPage', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	$('#palerts').load('/ws/page-flag/flag/' + pagex['pageId'],
		    function (responseText, textStatus, XMLHttpRequest) {
				if (XMLHttpRequest.status == 200) {
					$('#palerts').attr("style", "position:fixed;width: 590px;height:335px;background-color:black;z-index:1;border:2px solid white;padding:15px;");
					$('#palerts').show();
				} else {
					alert('Not Allowed!');
				}
		});
	return false;
});
$(document).off('click', '#btnPageHistory');
$(document).on('click', '#btnPageHistory', function(e) {
	$('#sub-content-a').load('/ws/page/revisions/' + pagex['pageId'], function(response, status, xhr) {
		if (status === 'error') {
			alert('Server is busy, please try later!');
			return;
		}
		$('#sub-content-a').show();
		$('#search-content').hide();
		$('#search-content').empty();
		$('#sub-content-b').hide();
		$('#sub-content-b').empty();
		$('#edition').hide();
		$('#edition').empty();
		$('#sub-main').hide();
		$('#page-action-button-container').removeClass('open');
		$('#btnPageAction').attr('aria-expanded', false);
		$('#btnPageAction').hide();
	});
	return false;
});
$(document).off('click', '#btnReportPage');
$(document).on('click', '#btnReportPage', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/ws/page/report/' + pagex['pageId']);
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnPageLock');
$(document).on('click', '#btnPageLock', function(e) {
	$.ajax({
		type: 'POST',
		url: '/ws/page/lock/' + pagex['pageId'],
		success: function(data) {
			$('div .btn-group, .btn-group-sm, .open').removeClass('open');
			var btn = document.getElementById('abpuk');
			if (btn != null) {
				btn.setAttribute('style', '');
				btn.setAttribute('id', 'btnPageUnlock');
			} else {
				btn = document.getElementById('btnPageUnlock');
				if (btn != null) {
					btn.setAttribute('style', '');
				}
			}
			btn = document.getElementById('btnPageLock');
			btn.setAttribute('style', 'display:none;');
			btn.setAttribute('id', 'abplk');
		},
		error: function(jqXHR, textStatus, errorThrown) {
            document.write(jqXHR.responseText);
            document.close();
		}
	});
	return false;
});
$(document).off('click', '#btnPageUnlock');
$(document).on('click', '#btnPageUnlock', function(e) {
	$.ajax({
		type: 'POST',
		url: '/ws/page/unlock/' + pagex['pageId'],
		success: function(data) {
			$('div .btn-group, .btn-group-sm, .open').removeClass('open');
			var btn = document.getElementById('abplk');
			if (btn != null) {
				btn.setAttribute('style', '');
				btn.setAttribute('id', 'btnPageLock');
			} else {
				btn = document.getElementById('btnPageLock');
				if (btn != null) {
					btn.setAttribute('style', '');
				}
			}
			btn = document.getElementById('btnPageUnlock');
			btn.setAttribute('style', 'display:none;');
			btn.setAttribute('id', 'abpuk');
		},
		error: function(jqXHR, textStatus, errorThrown) {
            document.write(jqXHR.responseText);
            document.close();
		}
	});
	return false;
});
$(document).off('click', '#btnPageAccess');
$(document).on('click', '#btnPageAccess', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/ws/page/access/' + pagex['pageId']);
	$('#breadcrumbs-section').hide();
	$('#sub-content-a').show();
	return false;
});

$(document).off('click', '#btnJavascript');
$(document).on('click', '#btnJavascript', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/ws/page/javascript/' + pagex['pageId']);
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnPageManageTags');
$(document).on('click', '#btnPageManageTags', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/wiki/private/tags-manage.jsp');
	$('#sub-content-a').show();
	if ($('#edition').length) {
		if ($('#edition').attr('data-type') == 'template') {
			$('#edition').hide();
		}
	}
	return false;
});
$(document).off('click', '#btnPageCacheDelete');
$(document).on('click', '#btnPageCacheDelete', function(e) {
	if (confirm('This will clear the cache for the current page. Are you sure?') == true) {
		$.ajax({
			type: 'GET',
			url: '/ws/wiki/clearcache/' + pagex['pageId'],
			success: function() {
				document.location = document.location;
			},
			error: function(jqXHR, textStatus, errorThrown) {
				document.write(jqXHR.responseText);
				document.close();
			}
		});
	}
	return false;
});
$(document).off('click', '#btnPageCommentsCacheDelete');
$(document).on('click', '#btnPageCommentsCacheDelete', function(e) {
	if (confirm('This will clear the comments cache for the current page. Are you sure?') == true) {
		$.ajax({
			type: 'GET',
			url: '/ws/comments/clearcache/' + pagex['pageId'],
			success: function() {
				document.location = document.location;
			},
			error: function(jqXHR, textStatus, errorThrown) {
				document.write(jqXHR.responseText);
				document.close();
			}
		});
	}
	return false;
});
$(document).off('click', '#btnPageDelete');
$(document).on('click', '#btnPageDelete', function(e) {
	if (confirm('This will delete the current page. Are you sure?') == true) {
		$.ajax({
			type: 'POST',
			url: '/ws/page/remove/' + pagex['pageId'],
			success: function(data) {
				document.location = '/';
			},
			error: function(jqXHR, textStatus, errorThrown) {
				document.write(jqXHR.responseText);
				document.close();
			}
		});
	}
	return false;
});
$(document).off('click', '#btnPageNotify');
$(document).on('click', '#btnPageNotify', function(e) {
	$.ajax({
		type: 'POST',
		url: '/ws/page/notify/' + pagex['pageId'],
		success: function(data) {
		    document.write(data);
		    document.close();
		},
		error: function(jqXHR, textStatus, errorThrown) {
            document.write(jqXHR.responseText);
            document.close();
		}, Async: false
	});
	return false;
});
$(document).off('click', '#btnPageBacklinks');
$(document).on('click', '#btnPageBacklinks', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/ws/backlink/' + pagex['pageId']);
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnTemplateNew');
$(document).on('click', '#btnTemplateNew', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/wiki/private/template-create.jsp');
	$('#page-content-header-container').hide();
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnTemplates');
$(document).on('click', '#btnTemplates', function(e) {
	document.location = '/wiki/templates';
	return false;
});
$(document).off('click', '.makesticky');
$(document).on('click', '.makesticky', function(e) {
	var control = $(this);
	var id = control.closest('.cmnt-root').attr('id');
	$.ajax({
		type: 'POST',
		url: '/ws/comments/make-sticky/' + pagex['pageId'] + '/' + id,
		success: function() {
			document.location = document.location;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$('#palerts').after('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Comment could not become sticky</div>');
		}
	});
	return false;
});
$(document).off('click', '.unmakesticky');
$(document).on('click', '.unmakesticky', function(e) {
	var control = $(this);
	var id = control.parent().parent().parent().parent().parent().parent().parent().attr('data-sticky');
	$.ajax({
		type: 'POST',
		url: '/ws/comments/unmake-sticky/' + pagex['pageId'] + '/' + id,
		success: function() {
			document.location = document.location;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$('#palerts').after('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Comment could not become normal</div>');
		}
	});
	return false;
});


//Top-right drop-down menu
$(document).off('click', '#btnTrddmCreate');
$(document).on('click', '#btnTrddmCreate', function(e) {
	$('#search-content').hide();
	$('#search-content').empty();
	$('#sub-content-a').hide();
	$('#sub-content-a').empty();
	$('#sub-content-b').hide();
	$('#sub-content-b').empty();
	$('#sub-main').hide();
	$('#sub-content-a').load('/wiki/private/page-create.jsp');
	$('#page-content-header-container').hide();
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnTrddmEdit');
$(document).on('click', '#btnTrddmEdit', function(e) {
console.log('edit a3');
	var pageId = $('#main-content').attr('data-pid');
	pagex['editor-page-id'] = pageId;
	$('#edition').load('/ws/weditor/page/' + pageId, function(response, status, xhr) {
		if (status === 'error') {
			alert('Server is busy, please try later!');
			$('.btn-group.btn-group-sm.open').removeClass('open');
			return;
		}
		$('#search-content').hide();
		$('#search-content').empty();
		$('#sub-content-a').hide();
		$('#sub-content-a').empty();
		$('#sub-content-b').hide();
		$('#sub-content-b').empty();
		$('#edition').hide();
		$('#sub-main').hide();
		$('#page-action-button-container').removeClass('open');
		$('#btnPageAction').attr('aria-expanded', false);
		$('#btnPageAction').hide();

		$('#edition').show();
		$('#btnPageEditorSave').removeAttr('disabled');
		$('#page-buttons-section').hide();
		$('#breadcrumbs-section').hide();
		$('.btn-group.btn-group-sm.open').removeClass('open');
		document.documentElement.scrollTop = 0;
	});
	return false;
});
$(document).off('click', '#btnTrddmHistory');
$(document).on('click', '#btnTrddmHistory', function(e) {
	$('#sub-content-a').load('/ws/page/revisions/' + pagex['pageId'], function(response, status, xhr) {
		if (status === 'error') {
			alert('Server is busy, please try later!');
			$('.btn-group.btn-group-sm.open').removeClass('open');
			return;
		}
		$('#sub-content-a').show();
		$('#search-content').hide();
		$('#search-content').empty();
		$('#sub-content-b').hide();
		$('#sub-content-b').empty();
		$('#edition').hide();
		$('#edition').empty();
		$('#sub-main').hide();
		$('#page-action-button-container').removeClass('open');
		$('#btnPageAction').attr('aria-expanded', false);
		$('#btnPageAction').hide();
		$('.btn-group.btn-group-sm.open').removeClass('open');
		document.documentElement.scrollTop = 0;
	});
	return false;
});
$(document).off('click', '#btnTrddmRename');
$(document).on('click', '#btnTrddmRename', function(e) {
	$('#sub-content-a').load('/ws/page/' + pagex['pageId'] + '/rename', function(response, status, xhr) {
		if (status === 'error') {
			alert('Server is busy, please try later!');
			$('.btn-group.btn-group-sm.open').removeClass('open');
			return;
		}
		$('#sub-content-a').show();
		$('#search-content').hide();
		$('#search-content').empty();
		$('#sub-content-b').hide();
		$('#sub-content-b').empty();
		$('#edition').hide();
		$('#edition').empty();
		$('#sub-main').hide();
		$('#page-action-button-container').removeClass('open');
		$('#btnPageAction').attr('aria-expanded', false);
		$('#btnPageAction').hide();
		$('.btn-group.btn-group-sm.open').removeClass('open');
	});
	return false;
});
$(document).off('click', '#btnTrddmRedirect');
$(document).on('click', '#btnTrddmRedirect', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/ws/page/' + pagex['pageId'] + '/redirect', function(responseText, textStatus, XMLHttpRequest) {
		switch (XMLHttpRequest.status) {
			case 200: break;
			default:
				$('#sub-content-a').html(responseText);
				break;
		}
	});
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnTrddmLock');
$(document).on('click', '#btnTrddmLock', function(e) {
	$.ajax({
		type: 'POST',
		url: '/ws/page/lock/' + pagex['pageId'],
		success: function(data) {
			$('div .btn-group, .btn-group-sm, .open').removeClass('open');
			var btn = document.getElementById('abpuk');
			if (btn != null) {
				btn.setAttribute('style', '');
				btn.setAttribute('id', 'btnTrddmUnlock');
			} else {
				btn = document.getElementById('btnTrddmUnlock');
				if (btn != null) {
					btn.setAttribute('style', '');
				}
			}
			btn = document.getElementById('btnTrddmLock');
			btn.setAttribute('style', 'display:none;');
			btn.setAttribute('id', 'abplk');
			document.location = document.location;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status == 403) {
				$('#palerts').after('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Forbidden</div>');
			} else {
				$('#palerts').after('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Error cannot lock page</div>');
			}
		}
	});
	return false;
});
$(document).off('click', '#lock');
$(document).on('click', '#lock', function(e) {
	var btnPLock = document.getElementById('lock');
	var btnPUlock = document.getElementById('unlock');
	$.ajax({
		type: 'POST',
		url: '/ws/page/lock/' + pagex['pageId'],
		success: function(data) {
			if (btnPLock != null) {
				btnPLock.parentElement.style.display = 'none';
			}
			if (btnPUlock != null) {
				btnPUlock.parentElement.style.display = 'block';
			}
			document.location = document.location;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status == 403) {
				$('#palerts').after('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Forbidden</div>');
			} else {
				$('#palerts').after('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Error cannot lock page</div>');
			}
		}
	});
	return false;
});
$(document).off('click', '#btnTrddmUnlock');
$(document).on('click', '#btnTrddmUnlock', function(e) {
	$.ajax({
		type: 'POST',
		url: '/ws/page/unlock/' + pagex['pageId'],
		success: function(data) {
			$('div .btn-group, .btn-group-sm, .open').removeClass('open');
			var btn = document.getElementById('abplk');
			if (btn != null) {
				btn.setAttribute('style', '');
				btn.setAttribute('id', 'btnTrddmLock');
			} else {
				btn = document.getElementById('btnTrddmLock');
				if (btn != null) {
					btn.setAttribute('style', '');
				}
			}
			btn = document.getElementById('btnTrddmUnlock');
			btn.setAttribute('style', 'display:none;');
			btn.setAttribute('id', 'abpuk');
			document.location = document.location;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status == 403) {
				$('#palerts').after('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Forbidden</div>');
			} else {
				$('#palerts').after('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Error cannot lock page</div>');
			}
		}
	});
	return false;
});
$(document).off('click', '#unlock');
$(document).on('click', '#unlock', function(e) {
	var btnPLock = document.getElementById('lock');
	var btnPUlock = document.getElementById('unlock');
	$.ajax({
		type: 'POST',
		url: '/ws/page/unlock/' + pagex['pageId'],
		success: function(data) {
			if (btnPLock != null) {
				btnPLock.parentElement.style.display = 'block';
			}
			if (btnPUlock != null) {
				btnPUlock.parentElement.style.display = 'none';
			}
			document.location = document.location;
		},
		error: function(jqXHR, textStatus, errorThrown) {
			if (jqXHR.status == 403) {
				$('#palerts').after('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Forbidden</div>');
			} else {
				$('#palerts').after('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Error cannot lock page</div>');
			}
		}
	});
	return false;
});
$(document).off('click', '#btnTrddmFlag');
$(document).on('click', '#btnTrddmFlag', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	$('#palerts').load('/ws/page-flag/flag/' + pagex['pageId'],
		    function (responseText, textStatus, XMLHttpRequest) {
				if (XMLHttpRequest.status == 200) {
					$('#palerts').attr("style", "position:fixed;width: 590px;height:335px;background-color:black;z-index:1;border:2px solid white;padding:15px;");
					$('#palerts').show();
				} else {
					alert('Not Allowed!');
				}
		});
	return false;
});
$(document).off('click', '#btnTrddmPermissions');
$(document).on('click', '#btnTrddmPermissions', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/ws/page/' + pagex['pageId'] + '/permissions', function(responseText, textStatus, XMLHttpRequest) {
		switch (XMLHttpRequest.status) {
		case 200: break;
		default:
			$('#sub-content-a').html(responseText);
			break;
	}
	});
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnTrddmJavascript');
$(document).on('click', '#btnTrddmJavascript', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/ws/page/' + pagex['pageId'] + '/javascript', function(responseText, textStatus, XMLHttpRequest) {
		switch (XMLHttpRequest.status) {
			case 200: break;
			default:
				$('#sub-content-a').html(responseText);
				break;
		}
	});
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnTrddmTags');
$(document).on('click', '#btnTrddmTags', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/ws/page/' + pagex['pageId'] + '/tags', function(responseText, textStatus, XMLHttpRequest) {
		switch (XMLHttpRequest.status) {
			case 200: break;
			default:
				$('#sub-content-a').html(responseText);
				break;
			}
	});
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnTrddmOpenGraph');
$(document).on('click', '#btnTrddmOpenGraph', function(e) {
	$('div .btn-group, .btn-group-sm, .open').removeClass('open');
	showWindow();
	$('#sub-content-a').load('/ws/pagemanager/' + pagex['pageId'] + '/open-graph-editor', function(responseText, textStatus, XMLHttpRequest) {
		switch (XMLHttpRequest.status) {
			case 200: break;
			default:
				$('#sub-content-a').html(responseText);
				break;
		}
	});
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnTrddmCommentsApproval');
$(document).on('click', '#btnTrddmCommentsApproval', function(e) {
	window.location.href = '/wiki/comments-approval';
	return false;
});
$(document).off('click', '#btnTrddmabpcdClearCache');
$(document).on('click', '#btnTrddmabpcdClearCache', function(e) {
	if (confirm('This will clear the cache for the current page. Are you sure?') == true) {
		$.ajax({
			type: 'GET',
			url: '/ws/wiki/clearcache/' + pagex['pageId'],
			success: function() {
				document.location = document.location;
			},
			error: function(jqXHR, textStatus, errorThrown) {
				document.write(jqXHR.responseText);
				document.close();
			}
		});
	}
	return false;
});
$(document).off('click', '#btnTrddmClearCommentsCache');
$(document).on('click', '#btnTrddmClearCommentsCache', function(e) {
	if (confirm('This will clear the comments cache for the current page. Are you sure?') == true) {
		$.ajax({
			type: 'GET',
			url: '/ws/comments/clearcache/' + pagex['pageId'],
			success: function() {
				document.location = document.location;
			},
			error: function(jqXHR, textStatus, errorThrown) {
				document.write(jqXHR.responseText);
				document.close();
			}
		});
	}
	return false;
});
$(document).off('click', '#btnTrddmDelete');
$(document).on('click', '#btnTrddmDelete', function(e) {
	if (confirm('This will delete the current page. Are you sure?') == true) {
		$.ajax({
			type: 'POST',
			url: '/ws/page/remove/' + pagex['pageId'],
			success: function(data) {
				document.location = '/';
			},
			error: function(jqXHR, textStatus, errorThrown) {
				document.write(jqXHR.responseText);
				document.close();
			}
		});
	}
	return false;
});
$(document).off('click', '#btnTrddmChanges');
$(document).on('click', '#btnTrddmChanges', function(e) {
	window.location.href = '/wiki/changes';
	return false;
});
$(document).off('click', '#btnTrddmFileManager');
$(document).on('click', '#btnTrddmFileManager', function(e) {
	window.location.href = location.protocol + '//' + location.host + '/wiki/filemanager';
	return false;
});
$(document).off('click', '#btnTrddmPageManager');
$(document).on('click', '#btnTrddmPageManager', function(e) {
	window.location.href = '/wiki/pagemanager';
	return false;
});
$(document).off('click', '#btnTrddmTemplates');
$(document).on('click', '#btnTrddmTemplates', function(e) {
	document.location = '/wiki/templates';
	return false;
});
$(document).off('click', '#btnTrddmSettings');
$(document).on('click', '#btnTrddmSettings', function(e) {
	window.location.href = '/wiki/settings';
	return false;
});
$(document).off('click', '#btnTrddmManager');
$(document).on('click', '#btnTrddmManager', function(e) {
	window.location.href = '/wiki/manager';
	return false;
});


function showWindow() {
	$('#search-content').hide();
	$('#search-content').empty();
	$('#sub-content-a').hide();
	$('#sub-content-a').empty();
	$('#sub-content-b').hide();
	$('#sub-content-b').empty();
	$('#edition').hide();
	$('#edition').empty();
	$('#sub-main').hide();
	$('#page-action-button-container').removeClass('open');
	$('#btnPageAction').attr('aria-expanded', false);
	$('#btnPageAction').hide();
	return false;
}

$(document).off('click', '#btnPageManageTagsFilters');
$(document).on('click', '#btnPageManageTagsFilters', function(e) {
	$('#search-content').hide();
	$('#search-content').empty();
	$('#sub-content-a').hide();
	$('#sub-content-a').empty();
	$('#sub-content-b').hide();
	$('#sub-content-b').empty();
	$('#main-content').hide();
	$('#sub-content-a').load('/wiki/private/tag-filter-manage.jsp');
	$('#sub-content-a').show();
	return false;
});

$(document).off('click', '#btnPageShowTaggedPages');
$(document).on('click', '#btnPageShowTaggedPages', function(e) {
	$('#search-content').hide();
	$('#search-content').empty();
	$('#sub-content-a').hide();
	$('#sub-content-a').empty();
	$('#sub-content-b').hide();
	$('#sub-content-b').empty();
	$('#main-content').hide();
	$('#sub-content-a').load('/wiki/private/tagged-pages.jsp');
	$('#sub-content-a').show();
	return false;
});

function changeUrl(title, url) {
    if (typeof (history.pushState) != "undefined") {
        var obj = { Title: title, Url: url };
        history.pushState(obj, obj.Title, obj.Url);
    } else {
        alert("Browser does not support HTML5.");
    }
    return false;
}


//********************************************************************
// Page-Menu
//********************************************************************
function searchPage(criteria) {
	if (criteria != '') {
		$('#sub-content-a').hide();
		$('#sub-content-a').empty();
		$('#sub-content-b').hide();
		$('#sub-content-b').empty();
		$('#main-content').hide();
		$('#search-content').empty();
		$('#search-content').show();
		$('#search-content').load('/ws/wiki/psearch/' + criteria + '/0');
	} else {
		$('#pages').empty();
		$('#psnrs').hide();
	}
	return false;
}

var delay = (function() {
	var timer = 0;
	return function(callback, ms) {
		clearTimeout (timer);
		timer = setTimeout(callback, ms);
	};
})();

$(document).off('keyup', '#page-name-search');
$(document).on('keyup', '#page-name-search', function(e) {
	var criteria = $(this).val();
	delay(function() {
		searchPage(criteria);
	}, 600);
	return false;
});
$(document).off('click', '#btnPageCreatex');
$(document).on('click', '#btnPageCreatex', function(e) {
	$('#search-content').hide();
	$('#search-content').empty();
	$('#sub-content-a').hide();
	$('#sub-content-a').empty();
	$('#sub-content-b').hide();
	$('#sub-content-b').empty();
	$('#sub-main').hide();
	$('#sub-content-a').load('/wiki/private/page-create.jsp');
	$('#page-content-header-container').hide();
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnFileManager');
$(document).on('click', '#btnFileManager', function(e) {
	window.location.href = location.protocol + '//' + location.host + '/wiki/filemanager';
	return false;
});
$(document).off('click', '#btn-fm-close');
$(document).on('click', '#btn-fm-close', function(e) {
	window.location.href = location;
	return false;
});

function fetchPages(wikiName, pageName, page) {
	var url = '/ws/wiki/pages/' + pageName + '/' + page;
	if ($('#all-wikis').is(':checked')) {
		url = '/ws/wiki/all/pages/' + pageName + '/' + page;
	}

	$.ajax({
		type: 'GET',
		url: url,
		dataType: 'json',
		success: function(data) {
			$('#pages').empty();
			var list = data == null ? null : (data instanceof Array ? data : [data]);
			if (list != null) {
				$('#psnrs').hide();
				$.each(list, function() {
					var date = new Date(this.date).toString();
					var dindex = date.indexOf(' (');
					date = dindex == -1 ? date : date.substring(0, dindex);
					var lastDate = new Date(this.lastDate).toString();
					var dlindex = lastDate.indexOf(' (');
					lastDate = dlindex == -1 ? lastDate : lastDate.substring(0, dlindex);
					$('#pages').append('<tr style="cursor: pointer;" href="' + this.link + '" class="page-search-result"><td>' + this.wiki + '</td><td>' + this.page + '</td><td>' + date + '</td><td>' + this.author + '</td><td>' + lastDate + '</td><td>' + this.lastAuthor + '</td></tr>');
				});
			} else {
				$('#psnrs').show();
			}
		},
		error: function() {
			$('#pages').empty();
			$('#psnrs').show();
		}
	});
	return false;
}


//********************************************************************
// Page-Comments
//********************************************************************
var total = 0;
var ccommenttxt = null;
var grecaptchaLoaded = false;

if (parseInt(ua) == 1) {
	$('#btnPostComment').attr('id','btnPostCommentu');
}

function getComments() {
	$('#btnMoreComents').text('Loading...');
	$('#btnMoreComents').attr('disabled', 'disabled');
	var pagenro = parseInt($('#discussions').attr('data'));
	$.ajax({
		type: 'GET',
		url: '/ws/comments/comments/' + pagex['pageId'] + '/' + pagenro,
		success: function(data) {
			if (data != null) {
				$('#discussions').attr('data', (pagenro + 1));
				renderComments(data);
			} else {
				$('#btnMoreComents').hide();
			}
			$('#btnMoreComents').removeAttr('disabled');
			$('#btnMoreComents').text('Load more');
		},
		error: function(jqXHR, textStatus, errorThrown) {
			$('#btnMoreComents').removeAttr('disabled');
			$('#btnMoreComents').text('Load more');
		}
	});
	return false;
}

function renderComments(data) {
	var comments = data == null ? null : (data.comments instanceof Array ? data.comments : [data.comments]);
	$.each(comments, function() {
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var plud = new Date(this.date);
		var date = ("0" + plud.getDate()).slice(-2) + ' ' + monthNames[plud.getMonth()] + ' ' + plud.getFullYear() + ' ' + ("0" + plud.getHours()).slice(-2) + ':' + ("0" + plud.getMinutes()).slice(-2);
//		var avatarLink = this.avatar != null && this.avatar != '' ? '//fextralife.com/avatars/' + this.avatar : '/images/avatar.png';
		var avatarLink = this.avatar != null && this.avatar != '' ? avatarUrl + this.avatar : '/images/avatar.png';
		var author = (this.author == 'Anonymous' ? '<div class="comment-username">' + this.author + '</div>' : '<a class="comment-username" href="https://fextralife.com/forums/memberlist.php?mode=viewprofile&amp;u=' + this.authorId + '" rel="nofollow" target="_blank"' + (this.color != null && this.color != '' ? ' style="color: #' + this.color + ';"' : '') + '>' + this.author + '</a>' + (this.authorIsVIP != null && this.authorIsVIP == true ? ' <i class="glyphicon glyphicon-star" style="color: gold;"> <a class="wiki_link" href="https://fextralife.com/be-a-vip/" target="_blank">VIP</a>' : ''));
		var z = 'id="btnPostReply"';
		if (parseInt(ua) == 1) {
			z = 'id="btnPostReplyu"';
		}
		if (data.isWiki != null && data.isWiki == true) {
			$('#discussions').append('<li id="' + this.id + '" class="cmnt-root" data="' + this.votes + '" data-d="' + this.date + '"><ul class="comments"><li class="comment-box"><div class="avatar"><img src="' + avatarLink + '" alt=""/>' + author + '</div><div class="comment"><div class="title"><span class="txt-subject">' + (this.subject != null && this.subject != '' ? this.subject : '') + '</span><input style="display: none;" class="txt-subject-ed"><span class="right cmt-ui">' + date + commentEdit + '</span></div><p class=\"txt-comment\">' + this.text + '</p><textarea style=\"display: none;\" class=\"txt-comment-ed\"></textarea><div class="clearfix"><a role="button" data-toggle="collapse" href="#zz-' + this.id + '" class="cmt-reply pull-right" href=""><span class="glyphicon glyphicon-share-alt"></span>Reply</a><a id="btnExpandComment" role="button" data-toggle="collapse" href="#replies-' + this.id + '" class="cmt-reply pull-right" href=""><span class="glyphicon glyphicon-share-alt"></span>Replies (<span class="replies">' + this.noreplies + '</span>)</a><div class="vote pull-right"><section class="t-up"><span></span><p>' + this.votesPos + '</p><i class="add">+1</i></section><section class="t-down"><span></span><p>' + this.votesNeg + '</p><i class="sub">-1</i></section></div></div><div class="collapse-com transparent"><div class="col-trigger collapse" id="zz-' + this.id + '"><div class="ng-scope"><textarea class="ng-pristine ng-untouched ng-invalid ng-invalid-required" placeholder="Input your comments:"></textarea><button ' + z + ' class="btn btn-default"><i class="glyphicon glyphicon-pencil"></i> Submit</button><img id="newCommentAvatar" src="' + avtr + '"/></div></div></div></div><div class="clearfix"></div><ul class="children collapse" id="replies-' + this.id + '"></ul></li></ul></li>');
		} else {
			if (ua == '111' || ua == '211') {
				$('#discussions').append('<li id="' + this.id + '" class="cmnt-root" data="' + this.votes + '" data-d="' + this.date + '"><ul class="comments"><li class="comment-box"><div class="avatar"><img src="' + avatarLink + '" alt=""/>' + author + '</div><div class="comment"><div class="title"><span class="txt-subject">' + (this.subject != null && this.subject != '' ? this.subject : '') + '</span><input style="display: none;" class="txt-subject-ed"><span class="right cmt-ui"><a href="https://fextralife.com/forums/t' + data.id + '/' + data.name + '" rel="nofollow" target="_blank">' + date + '</a>&nbsp;&nbsp;<a class="report-post" href="https://fextralife.com/forums/report.php?f=' + this.forumId + '&amp;p=' + this.id + '" target="_blank" title="report this post"><span class="glyphicon glyphicon-flag" aria-hidden="true"></span>  <span class="makesticky glyphicon glyphicon-pushpin" aria-hidden="true"></span></a></span></div><p class="txt-comment">' + this.text + '</p><textarea style="display: none;" class="txt-comment-ed"></textarea><div class="clearfix"><a role="button" data-toggle="collapse" href="#zz-' + this.id + '" class="cmt-reply pull-right"><span class="glyphicon glyphicon-share-alt"></span>Reply</a><a id="btnExpandComment" role="button" data-toggle="collapse" href="#replies-' + this.id + '" class="cmt-reply pull-right"><span class="glyphicon glyphicon-share-alt"></span>Replies (<span class="replies">' + this.noreplies + '</span>)</a><div class="vote pull-right"><section class="t-up"><span></span><p>' + this.votesPos + '</p><i class="add">+1</i></section><section class="t-down"><span></span><p>' + this.votesNeg + '</p><i class="sub">-1</i></section></div></div><div class="collapse-com transparent"><div class="col-trigger collapse" id="zz-' + this.id + '"><div class="ng-scope"><textarea class="ng-pristine ng-untouched ng-invalid ng-invalid-required" placeholder="Input your comments:"></textarea><button id="btn-' + this.id + '" class="btn btn-default btnPostReply"><i class="glyphicon glyphicon-pencil"></i> Submit</button><img id="newCommentAvatar" src="' + avtr + '"></div></div></div></div><div class="clearfix"></div><ul class="children collapse" id="replies-' + this.id + '"></ul></li></ul></li>');
			} else {
				$('#discussions').append('<li id="' + this.id + '" class="cmnt-root" data="' + this.votes + '" data-d="' + this.date + '"><ul class="comments"><li class="comment-box"><div class="avatar"><img src="' + avatarLink + '" alt=""/>' + author + '</div><div class="comment"><div class="title"><span class="txt-subject">' + (this.subject != null && this.subject != '' ? this.subject : '') + '</span><input style="display: none;" class="txt-subject-ed"><span class="right cmt-ui"><a href="https://fextralife.com/forums/t' + data.id + '/' + data.name + '" rel="nofollow" target="_blank">' + date + '</a>&nbsp;&nbsp;<a class="report-post" href="https://fextralife.com/forums/report.php?f=' + this.forumId + '&amp;p=' + this.id + '" target="_blank" title="report this post"><span class="glyphicon glyphicon-flag" aria-hidden="true"></span></a></span></div><p class="txt-comment">' + this.text + '</p><textarea style="display: none;" class="txt-comment-ed"></textarea><div class="clearfix"><a role="button" data-toggle="collapse" href="#zz-' + this.id + '" class="cmt-reply pull-right"><span class="glyphicon glyphicon-share-alt"></span>Reply</a><a id="btnExpandComment" role="button" data-toggle="collapse" href="#replies-' + this.id + '" class="cmt-reply pull-right"><span class="glyphicon glyphicon-share-alt"></span>Replies (<span class="replies">' + this.noreplies + '</span>)</a><div class="vote pull-right"><section class="t-up"><span></span><p>' + this.votesPos + '</p><i class="add">+1</i></section><section class="t-down"><span></span><p>' + this.votesNeg + '</p><i class="sub">-1</i></section></div></div><div class="collapse-com transparent"><div class="col-trigger collapse" id="zz-' + this.id + '"><div class="ng-scope"><textarea class="ng-pristine ng-untouched ng-invalid ng-invalid-required" placeholder="Input your comments:"></textarea><button id="btn-' + this.id + '" class="btn btn-default btnPostReply"><i class="glyphicon glyphicon-pencil"></i> Submit</button><img id="newCommentAvatar" src="' + avtr + '"></div></div></div></div><div class="clearfix"></div><ul class="children collapse" id="replies-' + this.id + '"></ul></li></ul></li>');
			}
		}
		total = total + 1 + parseInt(this.noreplies);
	});
	$('#amcom').text(' ' +total);
	return false;
}

function renderReplies(data, control) {
	var list = data == null ? [] : (data instanceof Array ? data : [data]);
	$.each(list, function() {
		var plud = new Date(this.date);
		var date = ("0" + plud.getDate()).slice(-2) + ' ' + monthNames[plud.getMonth()] + ' ' + plud.getFullYear() + ' ' + ("0" + plud.getHours()).slice(-2) + ':' + ("0" + plud.getMinutes()).slice(-2);
//		var a = this.avatar != null && this.avatar != '' ? '//fextralife.com/avatars/' + this.avatar : '/images/avatar.png';
		var a = this.avatar != null && this.avatar != '' ? avatarUrl + this.avatar : '/images/avatar.png';
		var author = (this.author == 'Anonymous' ? '<div class="comment-username">' + this.author + '</div>' : '<a class="comment-username" href="https://fextralife.com/forums/memberlist.php?mode=viewprofile&amp;u=' + this.authorId + '" rel="nofollow" target="_blank"' + (this.color != null && this.color != '' ? ' style="color: #' + this.color + ';"' : '') + '>' + this.author + '</a>' + (this.authorIsVIP != null && this.authorIsVIP == true ? ' <i class="glyphicon glyphicon-star" style="color: gold;"></i> <a class="wiki_link" href="https://fextralife.com/be-a-vip/" target="_blank">VIP</a>' : ''));
		control.append('<li id="' + this.id + '" class="comment-box reply-root"><div class="avatar"><img src="' + a + '" alt="" />' + author + '</div><div class="comment"><div class="title">&nbsp;<span class="right cmt-ui">' + date + '</span></div><p class=\"txt-reply\">' + this.text + '</p><textarea style=\"display: none;\" class=\"txt-reply-ed\"></textarea></div></li>');
	});
	control.show();
	return false;
}

$(document).off('click', '.t-up');
$(document).on('click', '.t-up', function(e) {
	var id = $(this).closest('.cmnt-root').attr('id');
	var control = $(this);
	$.ajax({
		type: 'POST',
		url: '/ws/comments/vote/' + pagex['pageId'] + '/' + id + '/Positive',
		success: function() {
			control.find('i').addClass('blip');
			var viicon = control.children().eq(0);
			var vind = control.children().eq(1);
			var vindv = parseInt(vind.text()) + 1;
			vind.text(vindv);
			viicon.addClass('clicked');
			var v = parseInt($('#' + id).attr('data')) + 1;
			$('#' + id).attr('data', v);
			control.find('span').addClass('clicked');
		},
		error: function(jqXHR, textStatus, errorThrown) {
		}
	});
	return false;
});

$(document).off('click', '.t-down');
$(document).on('click', '.t-down', function(e) {
	var id = $(this).closest('.cmnt-root').attr('id');
	var control = $(this);
	$.ajax({
		type: 'POST',
		url: '/ws/comments/vote/' + pagex['pageId'] + '/' + id + '/Negative',
		success: function() {
			control.find('i').addClass('blip');
			var viicon = control.children().eq(0);
			var vind = control.children().eq(1);
			var vindv = parseInt(vind.text()) + 1;
			vind.text(vindv);
			viicon.addClass('clicked');
			var v = parseInt($('#' + id).attr('data')) - 1;
			$('#' + id).attr('data', v);
			control.find('span').addClass('clicked');
		},
		error: function(jqXHR, textStatus, errorThrown) {
		}
	});
	return false;
});

$(document).off('click', '#btnExpandComment');
$(document).on('click', '#btnExpandComment', function(e) {
	var id = $(this).closest('.cmnt-root').attr('id');
	if ($('#replies-'+ id).attr('class') != 'children collapse in') {
		var control = $(this).closest('.cmnt-root').find('.children');
		$.ajax({
			type: 'GET',
			url: '/ws/comments/replies/' + id,
			success: function(data) {
				if (data != null) {
					control.empty();
					renderReplies(data.comments, control);
				}
			},
			error: function(jqXHR, textStatus, errorThrown) {
			}
		});
	}
	return false;
});

$(document).off('click', '#btnPostComment');
$(document).on('click', '#btnPostComment', function(e) {
	if ($('#dcomment').val() != '') {
		var control = $(this);
		control.attr('disabled', 'disabled');
		control.text(' Submitting...');

		var options = {};
		options['pageId'] = pagex['pageId'];
		options['text'] = $('#dcomment').val();
		options['recaptchaResponse'] = $('#g-recaptcha-response').val();

		$.ajax({
			type: 'POST',
			url: '/ws/comments/post/',
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(options),
			success: function(data) {
				if (data != null) {
					var rawdate = new Date(data.date);
					var idate = ("0" + rawdate.getDate()).slice(-2) + ' ' + monthNames[rawdate.getMonth()] + ' ' + rawdate.getFullYear() + ' ' + ("0" + rawdate.getHours()).slice(-2) + ':' + ("0" + rawdate.getMinutes()).slice(-2);
//					var iavatarLink = data.avatar != null && data.avatar != '' ? '//fextralife.com/avatars/' + data.avatar : '/images/avatar.png';
					var iavatarLink = data.avatar != null && data.avatar != '' ? avatarUrl + 'fextralife.com/avatars/' + data.avatar : '/images/avatar.png';
					var iauthor = (data.author == 'Anonymous' ? '<div class="comment-username">' + data.author + '</div>' : '<div><a class="comment-username" href="https://fextralife.com/forums/memberlist.php?mode=viewprofile&amp;u=' + data.authorId + '" rel="nofollow" target="_blank"' + (data.color != null && data.color != '' ? ' style="color: #' + data.color + ';"' : '') + '>' + data.author + '</a>' + (data.authorIsVIP != null && data.authorIsVIP == true ? ' <i class="glyphicon glyphicon-star" style="color: gold;"></i> <a class="wiki_link" href="https://fextralife.com/be-a-vip/" target="_blank">VIP</a>' : '') + '</div>');
					if (data.isWiki != null && data.isWiki == true) {
						$('#discussions').prepend('<li pp="1" id="' + data.id + '" class="cmnt-root" data="0" data-d="' + data.date + '"><ul id="comments" class="comments"><li class="comment-box"><div class="avatar"><img src="' + iavatarLink + '" alt="" />' + iauthor + '</div><div class="comment"><div class="title"><span class="txt-subject"></span><span class="right cmt-ui">' + idate + commentEdit + ' / <a style="display: none;" href="#"><span class="glyphicon glyphicon-trash"></span><span class="hidden-xs">Delete</span></a><a style="display: none;" href="#"><span class="glyphicon glyphicon-pencil"></span><span class="hidden-xs">Edit</span></a></span></div><p class="txt-comment">' + data.text + '</p><textarea style=\"display: none;\" class=\"txt-comment-ed\"></textarea><div class="clearfix"><a role="button" data-toggle="collapse" href="#zz-' + data.id + '" class="cmt-reply pull-right" href=""><span class="glyphicon glyphicon-share-alt"></span>Reply</a><a id="btnExpandComment" role="button" data-toggle="collapse" href="#replies-' + data.id + '" class="cmt-reply pull-right" href=""><span class="glyphicon glyphicon-share-alt"></span>Replies (<span class="replies">' + data.noreplies + '</span>)</a><div class="vote pull-right"><section class="t-up"><span></span><p>0</p><i class="add">+1</i></section><section class="t-down"><span></span><p>0</p><i class="sub">-1</i></section></div></div><div class="collapse-com transparent"><div class="col-trigger collapse" id="zz-' + data.id + '"><div class="ng-scope"><textarea class="ng-pristine ng-untouched ng-invalid ng-invalid-required" placeholder="Input your comments:"></textarea><button id="' + data.id + '" class="btn btn-default"><i class="glyphicon glyphicon-pencil"></i> Submit</button><img id="newCommentAvatar" src="' + avtr + '"/></div></div></div></div><div class="clearfix"></div><ul class="children collapse" id="replies-' + data.id + '"></ul></li></ul></li>');
					} else {
						if (ua == '111' || ua == '211') {
							$('#discussions').prepend('<li pp="2" id="' + data.id + '" class="cmnt-root" data="0" data-d="' + data.date + '"><ul class="comments"><li class="comment-box"><div class="avatar"><img src="' + iavatarLink + '" alt="">' + iauthor + '</div><div class="comment"><div class="title"><span class="txt-subject"></span><input style="display: none;" class="txt-subject-ed"><span class="right cmt-ui"><a href="https://fextralife.com/forums/t' + data.topicId + '/' + data.topicName + '" rel="nofollow" target="_blank">' + idate + '</a>&nbsp;&nbsp;<a class="report-post" href="https://fextralife.com/forums/report.php?f=' + data.forumId + '&amp;p=' + data.id + '" target="_blank" title="report this post"><span class="glyphicon glyphicon-flag" aria-hidden="true"></span>  <span class="makesticky glyphicon glyphicon-pushpin" aria-hidden="true"></span></a></span></div><p class="txt-comment">' + data.text + '</p><textarea style="display: none;" class="txt-comment-ed"></textarea><div class="clearfix"><a role="button" data-toggle="collapse" href="#zz-' + data.id + '" class="cmt-reply pull-right"><span class="glyphicon glyphicon-share-alt"></span>Reply</a><a id="btnExpandComment" role="button" data-toggle="collapse" href="#replies-' + data.id + '" class="cmt-reply pull-right"><span class="glyphicon glyphicon-share-alt"></span>Replies (<span class="replies">0</span>)</a><div class="vote pull-right"><section class="t-up"><span></span><p>0</p><i class="add">+1</i></section><section class="t-down"><span></span><p>0</p><i class="sub">-1</i></section></div></div><div class="collapse-com transparent"><div class="col-trigger collapse" id="zz-' + data.id + '"><div class="ng-scope"><textarea class="ng-pristine ng-untouched ng-invalid ng-invalid-required" placeholder="Input your comments:"></textarea><button id="btn-' + data.id + '" class="btn btn-default btnPostReply"><i class="glyphicon glyphicon-pencil"></i> Submit</button><img id="newCommentAvatar" src="' + avtr + '"></div></div></div></div><div class="clearfix"></div><ul class="children collapse" id="replies-' + data.id + '"></ul></li></ul></li>');
						} else {
							$('#discussions').prepend('<li pp="2" id="' + data.id + '" class="cmnt-root" data="0" data-d="' + data.date + '"><ul class="comments"><li class="comment-box"><div class="avatar"><img src="' + iavatarLink + '" alt="">' + iauthor + '</div><div class="comment"><div class="title"><span class="txt-subject"></span><input style="display: none;" class="txt-subject-ed"><span class="right cmt-ui"><a href="https://fextralife.com/forums/t' + data.topicId + '/' + data.topicName + '" rel="nofollow" target="_blank">' + idate + '</a>&nbsp;&nbsp;<a class="report-post" href="https://fextralife.com/forums/report.php?f=' + data.forumId + '&amp;p=' + data.id + '" target="_blank" title="report this post"><span class="glyphicon glyphicon-flag" aria-hidden="true"></span></a></span></div><p class="txt-comment">' + data.text + '</p><textarea style="display: none;" class="txt-comment-ed"></textarea><div class="clearfix"><a role="button" data-toggle="collapse" href="#zz-' + data.id + '" class="cmt-reply pull-right"><span class="glyphicon glyphicon-share-alt"></span>Reply</a><a id="btnExpandComment" role="button" data-toggle="collapse" href="#replies-' + data.id + '" class="cmt-reply pull-right"><span class="glyphicon glyphicon-share-alt"></span>Replies (<span class="replies">0</span>)</a><div class="vote pull-right"><section class="t-up"><span></span><p>0</p><i class="add">+1</i></section><section class="t-down"><span></span><p>0</p><i class="sub">-1</i></section></div></div><div class="collapse-com transparent"><div class="col-trigger collapse" id="zz-' + data.id + '"><div class="ng-scope"><textarea class="ng-pristine ng-untouched ng-invalid ng-invalid-required" placeholder="Input your comments:"></textarea><button id="btn-' + data.id + '" class="btn btn-default btnPostReply"><i class="glyphicon glyphicon-pencil"></i> Submit</button><img id="newCommentAvatar" src="' + avtr + '"></div></div></div></div><div class="clearfix"></div><ul class="children collapse" id="replies-' + data.id + '"></ul></li></ul></li>');
						}
					}
					total = total + 1;
					$('#amcom').text(' ' + total);
				}
				control.removeAttr('disabled');
				control.text(' Submit');
				$('#pmalerts').after('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Congratulations!!</strong> ' + (data.response != null ? data.response : 'You have posted a comment') + '</div>');
			},
			error: function(jqXHR, textStatus, errorThrown) {
				control.removeAttr('disabled');
				control.text(' Submit');
				$('#pmalerts').after('<div class="alert alert-warning alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Your comment could not be posted</div>');
			}
		});
		$('#dsubject').val('');
		$('#dcomment').val('');
	} else {
		alert('Comment cannot be empty!');
	}
	return false;
});

$(document).off('click', '#btnPostCommentu');
$(document).on('click', '#btnPostCommentu', function(e) {
	if (parseInt(ua) == 1) {
		if (!grecaptchaLoaded) {
			$('.g-recaptcha').attr('data-sitekey',grc);
			var element = document.createElement("script");
			var tstamp = new Date();
			element.src = "https://www.google.com/recaptcha/api.js?misc=" + tstamp.getTime();
			document.body.appendChild(element);
			grecaptchaLoaded = true;
		} else {
			grecaptcha.reset();
		}
	}

	var itext = $(this).parent().children().first();
        if (itext.val() == '') {
                alert('comment cannot be empty!');
        } else {
		if (parseInt(ua) == 1) {
			$('#myModal').attr('data', $(this).parent().parent().attr('id'));
			$('#btnPostComment').show();
			$('#btnPostReplyRecaptcha').hide();
			ccommenttxt = null;
			$('#g-recaptcha-response').val('');
			$('#myModal').modal('show');
		} else {
			doReply($(this));
		}
	}
	return false;
});

$(document).off('click', '.btnPostReply');
$(document).on('click', '.btnPostReply', function(e) {
	if (parseInt(ua) == 1) {
		if (!grecaptchaLoaded) {
			$('.g-recaptcha').attr('data-sitekey',grc);
			var element = document.createElement("script");
			var tstamp = new Date();
			element.src = "https://www.google.com/recaptcha/api.js?misc=" + tstamp.getTime();
			document.body.appendChild(element);
			grecaptchaLoaded = true;
		} else {
			grecaptcha.reset();
		}
	}

	var itext = $(this).parent().children().first();
	if (itext.val() == '') {
		alert('comment cannot be empty!');
	} else {
		if (parseInt(ua) == 1) {
			$('#myModal').attr('data', $(this).parent().parent().attr('id'));
			$('#btnPostComment').hide();
			$('#btnPostReplyRecaptcha').show();
			ccommenttxt = null;
			$('#g-recaptcha-response').val('');
			$('#myModal').modal('show');
		} else {
			doReply($(this));
		}
	}
	return false;
});

$(document).off('click', '#btnPostReply');
$(document).on('click', '#btnPostReply', function(e) {
	if (ccommenttxt == null) {
		ccommenttxt = $(this);
	}
	$(this).attr('disabled', 'disabled');
	var control = ccommenttxt.closest('.cmnt-root');
	var culId = $(this).parent().parent().attr('id');
	culId = culId.replace('zz-','replies-');
	var cul = $('#' + culId);
	var id = control.attr('id');
	var field = ccommenttxt.parent().children().first();
	if (field.val() != '') {
		var norepliesobj = ccommenttxt.parent().parent().parent().parent().find('.replies');
		var noreplies = parseInt(norepliesobj.text()) + 1;
		var control = ccommenttxt.parent().parent().parent().parent().parent().children().eq(3);
		var options = {};
		options['id'] = id;
		options['text'] = field.val();
		options['pageId'] = pagex['pageId'];
		options['parentId'] = id;
		options['recaptchaResponse'] = $('#g-recaptcha-response').val();

		$.ajax({
			type: 'POST',
			url: '/ws/comments/post/',
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(options),
			success: function(data) {
				if (data != null) {
					if (cul.attr('aria-expanded') == 'true') {
						var rawdate = new Date(data.date);
						var idate = ("0" + rawdate.getDate()).slice(-2) + ' ' + monthNames[rawdate.getMonth()] + ' ' + rawdate.getFullYear() + ' ' + ("0" + rawdate.getHours()).slice(-2) + ':' + ("0" + rawdate.getMinutes()).slice(-2);
//						var iavatarLink = data.avatar != null && data.avatar != '' ? '//fextralife.com/avatars/' + data.avatar : '/images/avatar.png';
						var iavatarLink = data.avatar != null && data.avatar != '' ? avatarUrl + data.avatar : '/images/avatar.png';
						var iauthor = (data.author == 'Anonymous' ? '<div class="comment-username">' + data.author + '</div>' : '<a class="comment-username" href="https://fextralife.com/forums/memberlist.php?mode=viewprofile&amp;u=' + data.authorId + '" rel="nofollow" target="_blank"' + (data.color != null && data.color != '' ? ' style="color: #' + data.color + ';"' : '') + '>' + data.author + '</a>' + (data.authorIsVIP != null && data.authorIsVIP == true ? ' <i class="glyphicon glyphicon-star" style="color: gold;"></i> <a class="wiki_link" href="https://fextralife.com/be-a-vip/" target="_blank">VIP</a>' : ''));
						cul.prepend('<li id="' + data.id + '" class="comment-box reply-root"><div class="avatar"><img src="' + iavatarLink + '" alt="" />' + iauthor + '</div><div class="comment"><div class="title">&nbsp;<span class="right cmt-ui">' + idate + '</span></div><p class=\"txt-reply\">' + data.text + '</p><textarea style=\"display: none;\" class=\"txt-reply-ed\"></textarea></div></li>');
					} else {
						$('a[href=#' + culId + ']').click();
					}
					norepliesobj.text(noreplies);
					total = total + 1;
					$('#amcom').text(' ' +total);
				}
				$('#pmalerts').after('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Congratulations!!</strong> ' + (data.response != null ? data.response : 'You have posted a comment') + '</div>');
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$('#pmalerts').after('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Your comment could not be posted</div>');
			}
		});

		field.val('');
	} else {
		alert('Comment cannot be empty!');
	}

	$(this).removeAttr('disabled');
	ccommenttxt = null;
	return false;
});

$(document).off('click', '#btnPostReplyRecaptcha');
$(document).on('click', '#btnPostReplyRecaptcha', function(e) {
	var objid = $('#myModal').attr('data');
	objid = objid.replace('zz-','btn-');
	var obj = $('#' + objid);
	doReply(obj);
	return false;
});

$(document).off('click', '#btnPostReplyu');
$(document).on('click', '#btnPostReplyu', function(e) {
	$('#myModal').attr('data', $(this).parent().parent().attr('id'));
	$('#btnPostReplyRecaptcha').show();
	$('#btnPostComment').hide();
	$('#btnPostReply').show();
	ccommenttxt = $(this);
	$('#g-recaptcha-response').val('');
	grecaptcha.reset();
	return false;
});

$(document).off('click', '#btnMoreComents');
$(document).on('click', '#btnMoreComents', function(e) {
	getComments();
	return false;
});

$(document).off('click', '.btnCommentCancel');
$(document).on('click', '.btnCommentCancel', function(e) {
	resetCommandEdition($(this));
	return false;
});

$(document).off('click', '.btnReplyCancel');
$(document).on('click', '.btnReplyCancel', function(e) {
	resetReplyEdition($(this));
	return false;
});

$(document).off('click', '#btnComments');
$(document).on('click', '#btnComments', function(e) {
	scroll_to("#discussions-section");
	return false;
});

function scroll_to(div){
	$('html, body').animate({
		scrollTop: $(div).offset().top
	},1000);
	return false;
}

function resetCommandEdition(btn) {
	var s = btn.closest('.cmnt-root').find('.txt-subject');
	var ns = btn.closest('.cmnt-root').find('.txt-subject-ed');
	var c = btn.closest('.cmnt-root').find('.txt-comment');
	var nc = btn.closest('.cmnt-root').find('.txt-comment-ed');
	var btnedit = btn.closest('.cmnt-root').find('.btnCommentEdit');
	var btndelete = btn.closest('.cmnt-root').find('.btnCommentDelete');
	var btnaccept = btn.closest('.cmnt-root').find('.btnCommentUpdate');
	var btncancel = btn.closest('.cmnt-root').find('.btnCommentCancel');

	btnaccept.hide();
	btncancel.hide();
	btnedit.show();
	btndelete.show();

	ns.hide();
	s.show();
	nc.hide();
	nc.text('');
	c.show();
	return false;
}

function resetReplyEdition(btn) {
	var ctrlsh = btn.closest('.reply-root').find('.txt-reply');
	var ctrled = btn.closest('.reply-root').find('.txt-reply-ed');
	var btnedit = btn.closest('.reply-root').find('.btnReplyEdit');
	var btndelete = btn.closest('.reply-root').find('.btnReplyDelete');
	var btnaccept = btn.closest('.reply-root').find('.btnReplyUpdate');
	var btncancel = btn.closest('.reply-root').find('.btnReplyCancel');

	btnaccept.hide();
	btncancel.hide();
	btnedit.show();
	btndelete.show();

	ctrled.hide();
	ctrled.text('');
	ctrlsh.show();
	return false;
}

function doReply(obj) {
	if (ccommenttxt == null) {
		ccommenttxt = obj;
	}
	obj.attr('disabled', 'disabled');
	var control = ccommenttxt.closest('.cmnt-root');
	var culId = obj.parent().parent().attr('id');
	culId = culId.replace('zz-','replies-');
	var cul = $('#' + culId);
	var id = control.attr('id');
	var field = ccommenttxt.parent().children().first();
	if (field.val() != '') {
		var norepliesobj = ccommenttxt.parent().parent().parent().parent().find('.replies');
		var noreplies = parseInt(norepliesobj.text()) + 1;
		var control = ccommenttxt.parent().parent().parent().parent().parent().children().eq(3);
		var options = {};
		options['id'] = id;
		options['text'] = field.val();
		options['pageId'] = pagex['pageId'];
		options['parentId'] = id;
		options['recaptchaResponse'] = $('#g-recaptcha-response').val();

		$.ajax({
			type: 'POST',
			url: '/ws/comments/post/',
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(options),
			success: function(data) {
				if (data != null) {
					if (cul.attr('aria-expanded') == 'true') {
						var rawdate = new Date(data.date);
						var idate = ("0" + rawdate.getDate()).slice(-2) + ' ' + monthNames[rawdate.getMonth()] + ' ' + rawdate.getFullYear() + ' ' + ("0" + rawdate.getHours()).slice(-2) + ':' + ("0" + rawdate.getMinutes()).slice(-2);
//						var iavatarLink = data.avatar != null && data.avatar != '' ? '//fextralife.com/avatars/' + data.avatar : '/images/avatar.png';
						var iavatarLink = data.avatar != null && data.avatar != '' ? avatarUrl + data.avatar : '/images/avatar.png';
						var iauthor = (data.author == 'Anonymous' ? '<div class="comment-username">' + data.author + '</div>' : '<a class="comment-username" href="https://fextralife.com/forums/memberlist.php?mode=viewprofile&amp;u=' + data.authorId + '" rel="nofollow" target="_blank"' + (data.color != null && data.color != '' ? ' style="color: #' + data.color + ';"' : '') + '>' + data.author + '</a>' + (data.authorIsVIP != null && data.authorIsVIP == true ? ' <i class="glyphicon glyphicon-star" style="color: gold;"> <a class="wiki_link" href="https://fextralife.com/be-a-vip/" target="_blank">VIP</a>' : ''));
						cul.prepend('<li id="' + data.id + '" class="comment-box reply-root"><div class="avatar"><img src="' + iavatarLink + '" alt="" />' + iauthor + '</div><div class="comment"><div class="title">&nbsp;<span class="right cmt-ui">' + idate + '</span></div><p class=\"txt-reply\">' + data.text + '</p><textarea style=\"display: none;\" class=\"txt-reply-ed\"></textarea></div></li>');
					} else {
						var noreplies = parseInt(obj.parent().parent().parent().prev().children().eq(1).children().eq(1).text());
						noreplies = noreplies + 1;
						var poop = '<a id="btnExpandComment" role="button" data-toggle="collapse" href="#replies-16002813" class="cmt-reply pull-right"><span class="glyphicon glyphicon-share-alt"></span>Replies (<span class="replies">' + noreplies + '</span>)</a>';
						obj.parent().parent().parent().prev().children().eq(1).replaceWith(poop);
					}
					norepliesobj.text(noreplies);
					total = total + 1;
					$('#amcom').text(' ' +total);
				}
				$('#pmalerts').after('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Congratulations!!</strong> ' + (data.response != null ? data.response : 'You have posted a comment') + '</div>');
			},
			error: function(jqXHR, textStatus, errorThrown) {
				$('#pmalerts').after('<div class="alert alert-success alert-dismissible fade in" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">x</span></button><strong>Warning!!</strong> Your comment could not be posted</div>');
			}
		});

		field.val('');
	} else {
		alert('Comment cannot be empty!');
	}

	obj.removeAttr('disabled');
	ccommenttxt = null;
	return false;
}

function sort_li(a, b){
	return (parseInt($(b).data('data'))) < (parseInt($(a).data('data'))) ? 1 : -1;
}

function dosort() {
	var mylist = $('#discussions');
	var listitems = mylist.children('li').get();
	listitems.sort(function(a, b) {
	   var compA = parseInt($(a).attr('data'));
	   var compB = parseInt($(b).attr('data'));
	   var compAd = parseInt($(a).attr('data-d'));
	   var compBd = parseInt($(b).attr('data-d'));
		if (compA == compB) {
			if (compAd == compBd) {
				return 0;
			} else if (compAd > compBd) {
				return -1;
			} else {
				return 1;
			}
		} else {
			if (compA > compB) {
				return -1;
			} else {
				return 1;
			}
		}
	});
	$.each(listitems, function(idx, itm) { mylist.append(itm); });
	return false;
}


//********************************************************************
// General JS Code
//********************************************************************
var isMobile = window.innerWidth < 680;

function getCode(code) {
	result = '001';
	if (code=='111') {
		result = 'x';
	} else {
		if (code=='o') {
			result = '110';
		} else {
			if (code=='v') {
				result = '100';
			} else {
				if (code=='m') {
					result = '011';
				} else {
					if (code=='a') {
						result = '010';
					}
				}
			}
		}
	}
	return result;
}

$('.spoiler').each(function() {
	var children = $(this).contents();
	$(this).empty();
	$(this).append('<div class="spoilertitle">Click to Show</div><div class="spoilercontent"></div>');
	$(this).children().last().append(children);
});

$('.help-options').append('<li><a href="https://darksouls3.wiki.fextralife.com/Editing+Guide" target="_blank" itemprop="url"><span class="navsprite miniring"></span>Wiki Help</a></li><li><a href="https://fextralife.com/contact-us/" target="_blank" itemprop="url"><span class="navsprite miniring"></span>Contact</a></li><li><a href="#" class="btn-switch" rel="/xcss/theme-light.css" itemprop="url"><span class="navsprite miniring"></span>White Theme</a></li><li><a href="#" class="btn-switch" rel="/xcss/inverse.css" itemprop="url"><span class="navsprite miniring"></span>Dark Theme</a></li><li role="separator" class="divider"></li><li><a href="/wiki/changes" itemprop="url"><span class="navsprite miniring"></span>Recent Changes</a></li>');

var commentEdit = '';
var replyEdit = '';
var avtr = '/images/avatar.png';
//var uxiid = null;
var pageal = $('#main-content').attr('data-ga').split('|');
var uavatar = 'https://swcdn.fextralife.com/images/avatar.png';

// new buttons
var btnTrddmHistory = document.getElementById('btnTrddmHistory');
if (btnTrddmHistory != null && pagex['pageId'] != null && pagex['pageId'] != '') {
	btnTrddmHistory.style.display = 'block';
} else {
	btnTrddmHistory.style.display = 'none';
}

var bpe = document.getElementById('btnPE');
if (bpe != null) {
	bpe.style.display = 'none';
}

var btnTrddmLock = document.getElementById('btnTrddmG');
if (btnTrddmLock != null) {
	btnTrddmLock.style.display = 'none';
}

if (c != null) {
//	uavatar = c[2] != null && c[2] != '' ? '//fextralife.com/avatars/' + c[2] : uavatar;
//	uavatar = user[3] != null && user[3] != '' ? '//fextralife.com/avatars/' + user[3] : uavatar;
	uavatar = user[3] != null && user[3] != '' ? avatarUrl + user[3] : uavatar;
console.log('suser: ' + decodeURIComponent(user[2]));
	$('.user').text(user[2]);
	var userSlot = document.getElementById('user-slot');
	if (userSlot != null) {
		userSlot.setAttribute('class', 'dropdown-toggle');
	}
	var userSlot1 = document.getElementById('user-slot1');
	if (userSlot1 != null) {
		userSlot1.setAttribute('class', 'dropdown-toggle');
	}
	if (c.split(':')[3] != '210' && c.split(':')[3] != '211') {
		$('#btnSignedUser').before('<button id="becomevip" class="btn btn-default" type="button" title="Subscribe to remove all ads"><i class="glyphicon glyphicon-star" style="color: gold;"></i> Become VIP</button>');
	}
	var userSlotDesktop = document.getElementById('user-slot-desktop');
	if (userSlotDesktop != null) {
		userSlotDesktop.setAttribute('class', 'dropdown-toggle');
	}
	var userSlotMobile = document.getElementById('user-slot-mobile');
	if (userSlotMobile != null) {
	        userSlotMobile.setAttribute('class', 'dropdown-toggle');
	}

//	var u = c.split(':');
//	uxiid = u[4];

	// Adding user avatar
	var userAvatar = document.getElementById('user-avatar');
	if (userAvatar != null) {
		var avatarImage = document.createElement('img');
		avatarImage.setAttribute('id', 'user-avatar');
		avatarImage.setAttribute('src', uavatar);	// new
		avatarImage.setAttribute('style', 'border-left-width:0px;width:30px;height:30px;');
		userAvatar.replaceWith(avatarImage);
	}

	var userAvatar2 = document.getElementById('user-avatar2');
	if (userAvatar2 != null) {
		var avatarImage2 = document.createElement('img');
		avatarImage2.setAttribute('id', 'user-avatar2');
		avatarImage2.setAttribute('src', uavatar);	// new
		avatarImage2.setAttribute('style', 'border-left-width:0px;width:30px;height:30px;');
		userAvatar2.replaceWith(avatarImage2);
	}

	var userAvatar1 = document.getElementById('user-avatar1');
	if (userAvatar1 != null) {
		var avatarImage1 = document.createElement('img');
		avatarImage1.setAttribute('id', 'user-avatar1');
		avatarImage1.setAttribute('src', uavatar);	// new
		avatarImage1.setAttribute('style', 'border-left-width:0px;width:30px;height:30px;');
		userAvatar1.replaceWith(avatarImage1);
	}

	$('#avatar').attr('src', uavatar);	// new
	// not working properly for ipad pro
	if (window.innerWidth < 860) {
		$('#userMenuBtn').empty();
		$('#userMenuBtn').addClass('navigation-avatar');
		$('#userMenuBtn').attr('style','width:100%;');
		$('#userMenuBtn').append('<a href="#"><img id="user-avatar" class="uavatar" src="' + uavatar + '" alt="" /></a>');	// new
	}
	$('.usrSignIn').text(user[2]);
	$('.usrSignIn').removeClass('usrSignIn');
	$('#usrSignOutDiv').show();
	$('#umname').hide();
	$('#umhelp').hide();
	

	// for the new dropdown menu
	var menuUserSlot = document.getElementById('menu-user-slot');
	if (menuUserSlot != null) {
		menuUserSlot.setAttribute('class', 'dropdown');
	}
	var userSlot = document.getElementById('user-slot');
	if (userSlot != null) {
		userSlot.setAttribute('class', 'dropdown-toggle');
		userSlot.setAttribute('data-toggle', 'dropdown');
		userSlot.setAttribute('role', 'button');
		userSlot.setAttribute('aria-haspopup', 'true');
		userSlot.setAttribute('aria-expanded', 'false');

		var userDropi = document.createElement('span');
		userDropi.setAttribute('class', 'caret');
		userSlot.appendChild(userDropi);
	}
	var userSlot1 = document.getElementById('user-slot1');
	if (userSlot1 != null) {
		userSlot1.setAttribute('class', 'dropdown-toggle');
		userSlot1.setAttribute('data-toggle', 'dropdown');
		userSlot1.setAttribute('role', 'button');
		userSlot1.setAttribute('aria-haspopup', 'true');
		userSlot1.setAttribute('aria-expanded', 'false');

		var userDropi1 = document.createElement('span');
		userDropi1.setAttribute('class', 'caret');
		userSlot1.appendChild(userDropi1);
	}
	var menuUserSlotDesktop = document.getElementById('menu-user-slot-desktop');
	if (menuUserSlotDesktop != null) {
		menuUserSlotDesktop.setAttribute('class', 'dropdown');
	}
	var menuUserSlotDesktop1 = document.getElementById('menu-user-slot-desktop1');
	if (menuUserSlotDesktop1 != null) {
		menuUserSlotDesktop1.setAttribute('class', 'dropdown');
	}
	var userSlotDesktop = document.getElementById('user-slot-desktop');
	if (userSlotDesktop != null) {
		userSlotDesktop.setAttribute('class', 'dropdown-toggle');
		userSlotDesktop.setAttribute('data-toggle', 'dropdown');
		userSlotDesktop.setAttribute('role', 'button');
		userSlotDesktop.setAttribute('aria-haspopup', 'true');
		userSlotDesktop.setAttribute('aria-expanded', 'false');

		var userDropi = document.createElement('span');
		userDropi.setAttribute('class', 'caret');
		userSlotDesktop.appendChild(userDropi);
	}
	var menuUserSlotMobile = document.getElementById('menu-user-slot-mobile');
	if (menuUserSlotMobile != null) {
		menuUserSlotMobile.setAttribute('class', 'dropdown');
	}
	var userSlotMobile = document.getElementById('user-slot-mobile');
	if (userSlotMobile != null) {
		userSlotMobile.setAttribute('class', 'dropdown-toggle');
		userSlotMobile.setAttribute('data-toggle', 'dropdown');
		userSlotMobile.setAttribute('role', 'button');
		userSlotMobile.setAttribute('aria-haspopup', 'true');
		userSlotMobile.setAttribute('aria-expanded', 'false');

		var userDropi = document.createElement('span');
		userDropi.setAttribute('class', 'caret');
		userSlotMobile.appendChild(userDropi);
	}

	$('.user-options').addClass('dropdown-menu');
	//$('.user-options').append('<li><a href="//fextralife.com/forums/memberlist.php?mode=viewprofile&u=' + user[1] + '" title="Profile" target="_blank">Profile</a></li><li><a class="finbox" title="" href="//fextralife.com/forums/ucp.php?i=pm&folder=inbox" target="_blank">Inbox (0)</a></li><li><a href="/wiki/link-discord-account" target="_blank">Link Discord</a></li><li><a href="/wiki/unlink-discord-account" target="_blank">Unlink Discord</a></li><li><a href="//fextralife.com/forums/ucp.php" target="_blank">User Panel</a></li><li><a href="//fextralife.com/forums/ucp.php?i=profile&mode=avatar" target="_blank">Avatar</a></li><li><a title="" href="mailto:legal@fextralife.com">GDPR & Deactivation</a></li><li><a href="https://fextralife.com/vip/" target="_blank">Manage your VIP</a></li><li><a id="btnLogout" href="#">Sign out</a></li>');
	$('.user-options').append('<li><a href="https://' + getFXDomain() + '/profile/account/" title="Profile" target="_blank">Profile</a></li><li><a href="https://' + getFXDomain() + '/profile/following/" title="Following" target="_blank">Following</a></li><li><a href="https://' + getFXDomain() + '/profile/account/" title="Account" target="_blank">Account</a></li><li><a href="https://' + getFXDomain() + '/profile/general/" title="Preferences" target="_blank">Preferences</a></li><li><a href="https://' + getFXDomain() + '/premium?ref=header" title="Premium" target="_blank">Premium</a></li><li><a id="btnLogout" href="#">Log out</a></li>');

	$('.user-options-desktop').addClass('dropdown-menu');
	$('.user-options-desktop').append('<li><a href="//fextralife.com/forums/memberlist.php?mode=viewprofile&u=' + user[1] + '" title="Profile" target="_blank">Profile</a></li><li><a class="finbox" title="" href="//fextralife.com/forums/ucp.php?i=pm&folder=inbox" target="_blank">Inbox (0)</a></li><li><a href="/wiki/link-discord-account" target="_blank">Link Discord</a></li><li><a href="/wiki/unlink-discord-account" target="_blank">Unlink Discord</a></li><li><a href="//fextralife.com/forums/ucp.php" target="_blank">User Panel</a></li><li><a href="//fextralife.com/forums/ucp.php?i=profile&mode=avatar" target="_blank">Avatar</a></li><li><a title="" href="mailto:legal@fextralife.com">GDPR & Deactivation</a></li><li><a href="https://fextralife.com/vip/" target="_blank">Manage your VIP</a></li><li><a id="btnLogout" href="#">Sign out</a></li>');
	$('.user-options-mobile').addClass('dropdown-menu');
	$('.user-options-mobile').append('<li><a href="//fextralife.com/forums/memberlist.php?mode=viewprofile&u=' + user[1] + '" title="Profile" target="_blank">Profile</a></li><li><a class="finbox" title="" href="//fextralife.com/forums/ucp.php?i=pm&folder=inbox" target="_blank">Inbox (0)</a></li><li><a href="/wiki/link-discord-account" target="_blank">Link Discord</a></li><li><a href="/wiki/unlink-discord-account" target="_blank">Unlink Discord</a></li><li><a href="//fextralife.com/forums/ucp.php" target="_blank">User Panel</a></li><li><a href="//fextralife.com/forums/ucp.php?i=profile&mode=avatar" target="_blank">Avatar</a></li><li><a title="" href="mailto:legal@fextralife.com">GDPR & Deactivation</a></li><li><a href="https://fextralife.com/vip/" target="_blank">Manage your VIP</a></li><li><a id="btnLogout" href="#">Sign out</a></li>');

	$('#signIn').text('Sign out');
	$('#signIn').attr('id', 'btnLogout');

	// Help Menu
	/*if (parseInt(ua) >= 11) {
		$('.help-options').append('<li><a href="/wiki/filemanager" itemprop="url"><span class="navsprite miniring"></span>File Manager</a></li><li><a href="/wiki/pagemanager" itemprop="url"><span class="navsprite miniring"></span>Page Manager</a></li>');
	}*/
	if (ua == '110' || ua == '210' || ua == '111' || ua == '211') {
		$('.help-options').append('<li><a href="/wiki/open-graph-manager" itemprop="url"><span class="navsprite miniring"></span>Open Graph Manager</a></li>');
	}
	if (ua == '111' || ua == '211') {
		$('.help-options').append('<li><a href="/wiki/changesmanager" itemprop="url"><span class="navsprite miniring"></span>Changes Manager</a></li><li><a href="/wiki/user/report" itemprop="url"><span class="navsprite miniring"></span>User Report</a></li>');
	}
	/*if (ua == '110' || ua == '210' || ua == '111' || ua == '211') {
		$('.help-options').append('<li><a href="/wiki/settings" itemprop="url"><span class="navsprite miniring"></span>Wiki Settings</a></li>');
		$('.help-options').append('<li><a href="/wiki/manager" itemprop="url"><span class="navsprite miniring"></span>Wiki Manager</a></li>');
	}*/
} else {
	$('#btnSignedUser').before('<button id="becomevip" class="btn btn-default" type="button" title="Subscribe to remove all ads"><i class="glyphicon glyphicon-star" style="color: gold;"></i> Become VIP</button>');
	$('#userMenuBtn').empty();
	$('#userMenuBtn').append('<button class="btn btn-default" type="button">Sign In Now</button>');
}

if (pageal.length > 5) {
	if (parseInt(ua) >= parseInt(getCode(pageal[5]))) {
		$('#breadcrumbs-bcontainer').css('display','initial');
	}

	// Top-right drop-down menu
	if (pageal[2] == 'u' || (pageal[2] == 'a' && parseInt(ua) >= 10) || (pageal[2] == 'm' && parseInt(ua) >= 11) || (pageal[2] == 'v' && parseInt(ua) >= 100) || (pageal[2] == 'o' && parseInt(ua) >= 110) || (pageal[2] == 'x' && parseInt(ua) >= 111)) {
		var btnTrddmCreate = document.getElementById('btnTrddmCreate');
		if (btnTrddmCreate != null) {
			btnTrddmCreate.setAttribute('style', '');
			btnTrddmCreate.setAttribute('data', pagex['pageId']);
		}
	}
	if (parseInt(ua) >= parseInt(getCode(pageal[1]))) {
		if (pageal[0] == 'u' || (pageal[0] == 'l' && parseInt(ua) >= 110)) {
			if (pageal[1] == 'u' || (pageal[1] == 'a' && parseInt(ua) >= 10) || (pageal[1] == 'm' && parseInt(ua) >= 11) || (pageal[1] == 'v' && parseInt(ua) >= 100) || (pageal[1] == 'o' && parseInt(ua) >= 110) || (pageal[1] == 'x' && parseInt(ua) >= 111 && parseInt(ua) != 210)) {
//				var bpe = document.getElementById('btnPE');
//				if (bpe != null) {
				if (bpe != null && pagex['pageId'] != null && pagex['pageId'] != '') {
//					bpe.setAttribute('style', '');
					bpe.style.display = 'block';
//					bpe.setAttribute('class', 'btn btn-default btnEditPage');
					bpe.setAttribute('class', 'left-side-button hidden-xs btnEditPage');
					bpe.setAttribute('data', pagex['pageId']);
				} else {
					bpe.style.display = 'none';
				}

				var btnTrddmEdit = document.getElementById('btnTrddmB');
				if (btnTrddmEdit != null && pagex['pageId'] != null && pagex['pageId'] != '') {
					btnTrddmEdit.setAttribute('style', '');
					btnTrddmEdit.setAttribute('data', pagex['pageId']);
					btnTrddmEdit.setAttribute('id', 'btnTrddmEdit');
				}

				var btnPostComment = document.getElementById('btnPostComment');
				if (btnPostComment != null) {
					var imgElement = document.createElement("img");
					imgElement.src = "https://swcdn.fextralife.com/images/caution-icon-42px.png";
					imgElement.className = "hidden-xs";
					imgElement.style = "background: none; position: initial; width: 42px; height: 42px; margin-top: 10px;";

					var pElement = document.createElement("p");
					pElement.className = "discrepancy hidden-xs";
					pElement.innerHTML = 'If you spot a discrepancy, try using the <span aria-hidden="true" class="glyphicon glyphicon-edit"></span>&nbsp;<strong id="btnTrddmEdit" data="' + pagex['pageId'] + '" style="cursor: pointer;">Edit</strong> tool to fix it or leave a comment in <a style="color:black;" href="https://discord.gg/AttZDFE" rel="no_follow" target="_blank">#wiki-issues on our discord</a>.';
					var maintag = document.getElementById("main-content");
					if (maintag && maintag.hasAttribute("data-color")) {
						var wikiColor = maintag.getAttribute("data-color");
						pElement.style.backgroundColor = '#' + wikiColor;
					}

					var parentElement = btnPostComment.parentElement;
					parentElement.insertBefore(imgElement, btnPostComment);
					parentElement.insertBefore(pElement, btnPostComment);
				}
			}
		}
	}

	if (parseInt(ua) >= 10) {
		var btnTrddmFlag = document.getElementById('btnTrddmI');
		if (btnTrddmFlag != null) {
			btnTrddmFlag.setAttribute('style', '');
			btnTrddmFlag.setAttribute('id', 'btnTrddmFlag')
		}

		var btnTrddmFileManager = document.getElementById('btnTrddmP');
		if (btnTrddmFileManager != null) {
			btnTrddmFileManager.setAttribute('style', '');
			btnTrddmFileManager.setAttribute('id', 'btnTrddmFileManager')
		}
	}

	if (parseInt(ua) >= 110) {
		commentEdit = ' / <a class=\"btnCommentEdit\" href=\"#\"><span class=\"glyphicon glyphicon-pencil\"></span><span class=\"hidden-xs\">Edit</span></a>&nbsp;<a class=\"btnCommentDelete\" href=\"#\"><span class=\"glyphicon glyphicon-trash\"></span><span class=\"hidden-xs\">Delete</span></a>&nbsp;<a class=\"btnCommentUpdate\" style=\"display: none;\" href=\"#\"><span class=\"glyphicon glyphicon-ok\"></span><span class=\"hidden-xs\">Save</span></a>&nbsp;<a class=\"btnCommentCancel\" style=\"display: none;\" href=\"#\"><span class=\"glyphicon glyphicon-remove\"></span><span class=\"hidden-xs\">Cancel</span></a>';
		replyEdit = ' / <a class=\"btnReplyEdit\" href=\"#\"><span class=\"glyphicon glyphicon-pencil\"></span> Edit</a>&nbsp;<a class=\"btnReplyDelete\" href=\"#\"><span class=\"glyphicon glyphicon-trash\"></span> Delete</a>&nbsp;<a class=\"btnReplyUpdate\" style=\"display: none;\" href=\"#\"><span class=\"glyphicon glyphicon-ok\"></span> Save</a>&nbsp;<a class=\"btnReplyCancel\" style=\"display: none;\" href=\"#\"><span class=\"glyphicon glyphicon-remove\"></span> Cancel</a>';

		var btnTrddmRename = document.getElementById('btnTrddmE');
		if (btnTrddmRename != null && pagex['pageId'] != null && pagex['pageId'] != '') {
			btnTrddmRename.setAttribute('style', '');
			btnTrddmRename.setAttribute('id', 'btnTrddmRename')
		}

		var btnTrddmRedirect = document.getElementById('btnTrddmF');
		if (btnTrddmRedirect != null && pagex['pageId'] != null && pagex['pageId'] != '') {
			btnTrddmRedirect.setAttribute('style', '');
			btnTrddmRedirect.setAttribute('id', 'btnTrddmRedirect')
		}

		var btnPLock = document.getElementById('lock');
		var btnPUlock = document.getElementById('unlock');
		if (pagex['pageId'] == null || pagex['pageId'] == '') {
			if (btnPLock != null) {
				btnPLock.parentElement.style.display = 'none';
			}
			if (btnPUlock != null) {
				btnPUlock.parentElement.style.display = 'none';
			}
		}
		if (pageal[0] == 'u') {
//			var btnTrddmLock = document.getElementById('btnTrddmG');
			if (btnTrddmLock != null && pagex['pageId'] != null && pagex['pageId'] != '') {
//				btnTrddmLock.setAttribute('style', '');
				btnTrddmLock.style.display = 'block';
				btnTrddmLock.setAttribute('id', 'btnTrddmLock');
			} else {
				btnTrddmLock.style.display = 'none';
				btnTrddmLock.setAttribute('id', 'btnTrddmLock');
			}
			if (btnPLock != null) {
				btnPLock.parentElement.style.display = 'block';
			}
			if (btnPUlock != null) {
				btnPUlock.parentElement.style.display = 'none';
			}
//console.log('show lock');
		} else {
			var btnTrddmLock = document.getElementById('btnTrddmG');
			if (btnTrddmLock != null && pagex['pageId'] != null && pagex['pageId'] != '') {
				btnTrddmLock.style.display = 'none';
			}
			var btnTrddmUnlock = document.getElementById('btnTrddmH');
			if (btnTrddmUnlock != null && pagex['pageId'] != null && pagex['pageId'] != '') {
				btnTrddmUnlock.style.display = 'block';
				btnTrddmUnlock.setAttribute('id', 'btnTrddmUnlock')
			} else {
				btnTrddmUnlock.style.display = 'none';
				btnTrddmUnlock.setAttribute('id', 'btnTrddmUnlock')
			}
			if (btnPLock != null) {
				btnPLock.parentElement.style.display = 'none';
			}
			if (btnPUlock != null) {
				btnPUlock.parentElement.style.display = 'block';
			}
//console.log('show unlock');
		}

		var btnTrddmPermissions = document.getElementById('btnTrddmJ');
		if (btnTrddmPermissions != null && pagex['pageId'] != null && pagex['pageId'] != '') {
			btnTrddmPermissions.setAttribute('style', '');
			btnTrddmPermissions.setAttribute('id', 'btnTrddmPermissions')
		}

		var btnTrddmJavascript = document.getElementById('btnTrddmK');
		if (btnTrddmJavascript != null && pagex['pageId'] != null && pagex['pageId'] != '') {
			btnTrddmJavascript.setAttribute('style', '');
			btnTrddmJavascript.setAttribute('id', 'btnTrddmJavascript')
		}

		var btnTrddmTags = document.getElementById('btnTrddmL');
		if (btnTrddmTags != null && pagex['pageId'] != null && pagex['pageId'] != '') {
			btnTrddmTags.setAttribute('style', '');
			btnTrddmTags.setAttribute('id', 'btnTrddmTags')
		}

		var btnTrddmOpenGraph = document.getElementById('btnTrddmM');
		if (btnTrddmOpenGraph != null && pagex['pageId'] != null && pagex['pageId'] != '') {
			btnTrddmOpenGraph.setAttribute('style', 'cursor: pointer;');
			btnTrddmOpenGraph.setAttribute('id', 'btnTrddmOpenGraph')
		}

		var btnTrddmCommentsApproval = document.getElementById('btnTrddmS');
		if (btnTrddmCommentsApproval != null) {
			btnTrddmCommentsApproval.setAttribute('style', 'cursor: pointer;');
			btnTrddmCommentsApproval.setAttribute('id', 'btnTrddmCommentsApproval')
		}

		var btnTrddmabpcdClearCache = document.getElementById('btnTrddmN');
		if (btnTrddmabpcdClearCache != null && pagex['pageId'] != null && pagex['pageId'] != '') {
			btnTrddmabpcdClearCache.setAttribute('style', 'cursor: pointer;');
			btnTrddmabpcdClearCache.setAttribute('id', 'btnTrddmabpcdClearCache')
		}

		var btnTrddmClearCommentsCache = document.getElementById('btnTrddmO');
		if (btnTrddmClearCommentsCache != null && pagex['pageId'] != null && pagex['pageId'] != '') {
			btnTrddmClearCommentsCache.setAttribute('style', 'cursor: pointer;');
			btnTrddmClearCommentsCache.setAttribute('id', 'btnTrddmClearCommentsCache')
		}

		var btnTrddmDelete = document.getElementById('btnTrddmV');
		if (btnTrddmDelete != null  && pagex['pageId'] != null && pagex['pageId'] != '') {
			btnTrddmDelete.setAttribute('style', 'cursor: pointer;');
			btnTrddmDelete.setAttribute('id', 'btnTrddmDelete')
		}

		var btnTrddmPageManager = document.getElementById('btnTrddmQ');
		if (btnTrddmPageManager != null) {
			btnTrddmPageManager.setAttribute('style', 'cursor: pointer;');
			btnTrddmPageManager.setAttribute('id', 'btnTrddmPageManager')
		}

		var btnTrddmSettings = document.getElementById('btnTrddmT');
		if (btnTrddmSettings != null) {
			btnTrddmSettings.setAttribute('style', 'cursor: pointer;');
			btnTrddmSettings.setAttribute('id', 'btnTrddmSettings')
		}

		var btnTrddmManager = document.getElementById('btnTrddmU');
		if (btnTrddmManager != null) {
			btnTrddmManager.setAttribute('style', 'cursor: pointer;');
			btnTrddmManager.setAttribute('id', 'btnTrddmManager')
		}

		var btnTrddmTemplates = document.getElementById('btnTrddmR');
		if (btnTrddmTemplates != null) {
			btnTrddmTemplates.setAttribute('style', '');
			btnTrddmTemplates.setAttribute('id', 'btnTrddmTemplates')
		}

		var dividera = document.getElementById('divider-trddm-a');
		if (dividera != null) {
			dividera.setAttribute('style', '');
		}

		var dividerb = document.getElementById('divider-trddm-b');
		if (dividerb != null) {
			dividerb.setAttribute('style', '');
		}

		var dividerc = document.getElementById('divider-trddm-c');
		if (dividerc != null) {
			dividerc.setAttribute('style', '');
		}

		var dividerd = document.getElementById('divider-trddm-d');
		if (dividerd != null) {
			dividerd.setAttribute('style', '');
		}
	}

	// Bottom buttons
	if (parseInt(ua) >= 100) {
		var wwc = document.getElementById('wwc');
		if (wwc != null) {
			wwc.setAttribute('style', 'cursor: pointer;');
			wwc.setAttribute('id', 'btnWikiChanges');
		}
		var wpc = document.getElementById('wpc');
		if (wpc != null) {
			wpc.setAttribute('style', 'cursor: pointer;');
			wpc.setAttribute('id', 'btnPageCreatex');
		}
		var wfm = document.getElementById('wfm');
		if (wfm != null) {
			wfm.setAttribute('style', 'cursor: pointer;');
			wfm.setAttribute('id', 'btnFileManager');
		}
		if (parseInt(ua) >= 110) {
			var wbs = document.getElementById('wbpm');
			if (wbs != null) {
				wbs.setAttribute('style', 'cursor: pointer;');
				wbs.setAttribute('id', 'btnPageManager');
			}
			var wbs = document.getElementById('wbs');
			if (wbs != null) {
				wbs.setAttribute('style', 'cursor: pointer;');
				wbs.setAttribute('id', 'btnSettings');
			}
		}
	}

	if (parseInt(ua) >= 110 || parseInt(ua) >= parseInt(getCode(pageal[6]))) {
		var abpt = document.getElementById('abpt');
		if (abpt != null) {
			abpt.setAttribute('style', '');
			abpt.setAttribute('id', 'btnPageManageTags');
		}
	}
	if (parseInt(ua) >= 110 || parseInt(ua) >= parseInt(getCode(pageal[3]))) {
		var abeog = document.getElementById('abeog');
		if (abeog != null) {
			abeog.setAttribute('style', '');
			abeog.setAttribute('id', 'btnEditOpenGraph');
		}
		var abpcd = document.getElementById('abpcd');
		if (abpcd != null) {
			var dividerc = document.getElementById('divider-c');
			if (dividerc != null) {
				dividerc.setAttribute('style', '');
			}
			abpcd.setAttribute('style', '');
			abpcd.setAttribute('id', 'btnPageCacheDelete');
		}
		var abpccd = document.getElementById('abpccd');
		if (abpccd != null) {
			var dividerc = document.getElementById('divider-c');
			if (dividerc != null) {
				dividerc.setAttribute('style', '');
			}
			abpccd.setAttribute('style', '');
			abpccd.setAttribute('id', 'btnPageCommentsCacheDelete');
		}
		var abpd = document.getElementById('abpd');
		if (abpd != null) {
			var dividerz = document.getElementById('divider-z');
			if (dividerz != null) {
				dividerz.setAttribute('style', '');
			}
			abpd.setAttribute('style', '');
			abpd.setAttribute('id', 'btnPageDelete');
		}
	}
	if (ua == '111' || ua == '211') {
		var abcsapp = document.getElementById('abcsapp');
		if (abcsapp != null) {
			abcsapp.setAttribute('style', '');
			abcsapp.setAttribute('id', 'btnCommentsApproval');
		}
		var abwkmngr = document.getElementById('abwkmngr');
		if (abwkmngr != null) {
			abwkmngr.setAttribute('style', '');
			abwkmngr.setAttribute('id', 'btnWikiManager');
		}
	}
	if (parseInt(ua) >= 110 || parseInt(ua) >= parseInt(getCode(pageal[4]))) {
		$('#divider-b').css('display','');

		var abpt = document.getElementById('abpt');
		if (abpt != null) {
			abpt.setAttribute('style', '');
			abpt.setAttribute('id', 'btnTemplateNew');
		}

		var abpts = document.getElementById('abpts');
		if (abpts != null) {
			abpts.setAttribute('style', '');
			abpts.setAttribute('id', 'btnTemplates');
		}
	}
}
var con = '';

function renderResult(data) {
	var isEmpty = true;
	$.each(data.results, function() {
		var im = '';
		if (this.richSnippet != null && this.richSnippet.cseImage != null && this.richSnippet.cseImage.src) {
			im = '<img src="' + this.richSnippet.cseImage.src + '" alt="Search Result" style="max-width:100px;max-height:100px" class="media-object">';
		}
		$('#search-result').append('<li class="type-document"><div class="media"><div class="pull-left">' + im + '</div><div class="media-body"><h3 class="srtt"><a class="srtlink"href="' + this.unescapedUrl + '">' + this.titleNoFormatting + '</a></h3><span class="result-url">' + this.unescapedUrl + '</span><p>' + this.contentNoFormatting + '</p><span class="text-muted"></span></div></div></li>');
		isEmpty = false;
	});
	if (isEmpty) {
		$('#search-result').append('<li class="no-results">No results found!<li>');
	}
	return false;
}

$(document).off('keyup', '.gsc-input');
$(document).on('keyup', '.gsc-input', function(e) {
  var keycode = (e.keyCode ? e.keyCode : e.which);
  if (keycode == '13') {
    $('#main-content').hide();
    $('#search-content').show();
  }
  return false;
});
$(document).off('keyup', '#spf');
$(document).on('keyup', '#spf', function(e) {
	var keycode = (e.keyCode ? e.keyCode : e.which);
	if (keycode == '13') {
		var sto = $('#search-trigger');
		if (sto.attr('data') == 'not-loaded') {
			function gcseCallback() {
				$('.gsc-input').val(con);
				$('#main-content').hide();
				$('#search-content').show();
				$('.gsc-search-button-v2').click();
			};
			window.__gcse = {
				callback: gcseCallback
			};
			(function() {
				var gcse = document.createElement('script');
				gcse.type = 'text/javascript';
				gcse.async = true;
				gcse.src = '//cse.google.com/cse.js?cx=' + cx;
				var s = document.getElementsByTagName('script')[0];
				s.parentNode.insertBefore(gcse, s);
			})();
			sto.attr('data','loaded');
		} else {
			$('.gsc-input').val(con);
			$('#main-content').hide();
			$('#search-content').show();
			$('.gsc-search-button-v2').click();
		}
	} else {con = $(this).val();}
	return false;
});
var nsob = document.getElementById('xspf');
if (nsob != null) {
	$(document).off('keyup', '#xspf');
	$(document).on('keyup', '#xspf', function(e) {
		var keycode = (e.keyCode ? e.keyCode : e.which);
		if (keycode == '13') {
			var sto = $('#search-trigger');
			if (sto.attr('data') == 'not-loaded') {
				function gcseCallback() {
					$('.gsc-input').val(con);
					$('#main-content').hide();
					$('#search-content').show();
					$('.gsc-search-button-v2').click();
				};
				window.__gcse = {
					callback: gcseCallback
				};
				(function() {
					var gcse = document.createElement('script');
					gcse.type = 'text/javascript';
					gcse.async = true;
					gcse.src = '//cse.google.com/cse.js?cx=' + cx;
					var s = document.getElementsByTagName('script')[0];
					s.parentNode.insertBefore(gcse, s);
				})();
				sto.attr('data','loaded');
			} else {
				$('.gsc-input').val(con);
				$('#main-content').hide();
				$('#search-content').show();
				$('.gsc-search-button-v2').click();
			}
		} else {
			con = $(this).val();
		}
		return false;
	});
}
$(document).off('click', '.spoilertitle');
$(document).on('click', '.spoilertitle', function(e) {
	var kk = $(this).next();
	if (kk.css('display') != 'none') {
		kk.css('display','none');
		$(this).text('Click to Show');
	} else {
		kk.css('display','initial');
		$(this).text('Click to Hide');
	}
	return false;
});
$(document).off('click', '.tabtitle');
$(document).on('click', '.tabtitle', function(e) {
	var tab = $(this).attr('class').replace('tabtitle','').trim();
	var group = '';
	var kk = tab.split(' ');
	if (kk.length > 1) {
		group = '.' + kk[0];
		tab = kk[1];
	}
	$('.tabtitle' + group).removeClass('tabcurrent');
	$(this).addClass('tabcurrent');
	$('.tabcontent' + group).removeClass('tabcurrent');
	$('.tabcontent' + group + '.' + tab).addClass('tabcurrent');
	return false;
});
$(document).off('click', '#btnWikiChanges');
$(document).on('click', '#btnWikiChanges', function(e) {
	window.location.href = '/wiki/changes';
	return false;
});
$(document).off('click', '#btnPageManager');
$(document).on('click', '#btnPageManager', function(e) {
	window.location.href = '/wiki/pagemanager';
	return false;
});
$(document).off('click', '#btnSettings');
$(document).on('click', '#btnSettings', function(e) {
	window.location.href = '/wiki/settings';
	return false;
});
$(document).off('click', '.play-button');
$(document).on('click', '.play-button', function(e) {
	var vcontrol = $(this).parent().parent();
	var vid = vcontrol.attr('data-video');
	var vlid = vcontrol.attr('data-playlist');
	var width = vcontrol.innerWidth();
	var height = vcontrol.innerHeight();
	var title = '';
	var style = '';
	var vc = $(this).parent();
	vc.parent().replaceWith('<iframe title="' + title + '" type="text/html" width="' + width +'" height="' + height + '" src="//www.youtube.com/embed/' + vid + '?autoplay=1' + vlid + '" frameborder="0" style="' + style + '" allowFullScreen></iframe>');
	return false;
});
$(document).off('click', '#becomevip');
$(document).on('click', '#becomevip', function(e) {
	 window.open('//fextralife.com/be-a-vip/', '_blank');
	return false;
});
$(document).off('click', '.sign-in');
$(document).on('click', '.sign-in', function(e) {
	window.location.href = '/wiki/authentication';
	return false;
});
$(document).off('click', '#signIn');
$(document).on('click', '#signIn', function(e) {
	window.location.href = '/wiki/authentication';
	return false;
});
/*$(document).on('click', '#btnLogout', function(e) {
	pagex['userName'] = null;
	$('#form-header').submit();
	return false;
});*/
$(document).off('click', '.sign-in');
$(document).on('click', '.sign-in', function(e) {
	window.location.href = '/wiki/authentication';
	return false;
});
$(document).off('click', '.sign-out');
$(document).on('click', '.sign-out', function(e) {
	pagex['userName'] = null;
	$('#form-header').submit();
	return false;
});
$(document).off('mouseover', '#fex-account');
$(document).on('mouseover', '#fex-account', function(e) {
	var fexAccount = $('#fex-account > .btn-group');
	fexAccount.animate({'right': 0});
	return false;
});
/* smooth scrolling for scroll to top */
var offset = 220;
var duration = 500;
jQuery('.scroll-top').click(function(event) {
	event.preventDefault();
	jQuery('html, body').animate({scrollTop: 0}, duration);
	return false;
});
$(document).off('click', '.embedded-tab-link');
$(document).on('click', '.embedded-tab-link', function(e) {
	$('.embedded-tab').hide();
	$('#embedded-tab-' + $(this).attr('id')).show();
	return false;
});
$(document).off('click', '#btnWikis');
$(document).on('click', '#btnWikis', function(e) {
	$('#search-content').hide();
	$('#search-content').empty();
	$('#sub-content-a').hide();
	$('#sub-content-a').empty();
	$('#sub-content-b').hide();
	$('#sub-content-b').empty();
	$('#main-content').hide();
	$('#sub-content-a').load('/wiki/private/wikis.jsp');
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnWikiMembers');
$(document).on('click', '#btnWikiMembers', function(e) {
	$('#search-content').hide();
	$('#search-content').empty();
	$('#sub-content-a').hide();
	$('#sub-content-a').empty();
	$('#sub-content-b').hide();
	$('#sub-content-b').empty();
	$('#main-content').hide();
	$('#sub-content-a').load('/wiki/private/wiki-members.jsp');
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btn-login-cancel');
$(document).on('click', '#btn-login-cancel', function(e) {
	document.location = '/';
	return false;
});
$(document).off('click', '#btnCloseContentB');
$(document).on('click', '#btnCloseContentB', function(e) {
	$('#sub-content-b').hide();
	$('#sub-content-b').empty();
	$('#page-content-header-container').show();
	$('#sub-content-a').show();
	return false;
});
$(document).off('click', '#btnUserWikis');
$(document).on('click', '#btnUserWikis', function(e) {
	document.location = '//testwiki.fextralife.com';
	return false;
});
/*$(document).on('click', '#btnLogout', function(e) {
	pagex['userName'] = null;
	$('#form-header').submit();
	return false;
});*/
$('#btnChangePassword').click(function() {
	$('#modal-password').modal();
	$('#simplemodal-container').css('height', '205px');
	return false;
});
$('#btnDoChangePassword').click(function() {
	if (!passwordError) {
		if ($('#newPassword').val() != $('#newPasswordCheck').val()) {
			$('#newPasswordCheck').addClass("invalid");
			$('#error').text('retyped password does not macth!');
			passwordError = true;
		}
		else {
			$('#newPasswordCheck').removeClass("invalid");
			$('#error').text('');

			var options = {};
			options["currentPassword"] = $('#currentPassword').val();
			options["newPassword"] = $('#newPassword').val();
			var data = JSON.stringify(options);

			$.ajax({
				type: 'PUT',
				contentType: 'application/json',
				url: userRootURL + '/password',
				dataType: 'json',
				data: data,
				success: function(data, textStatus, jqXHR) {
					$('#btnDoChangePasswordCancel').click();
					alert('Password changed!');
				},
				error: function(jqXHR, textStatus, errorThrown) {
					if (jqXHR.responseText.indexOf('</html>') > -1) {
						alert('Unable to change password!');
					}
					else {
						alert(jqXHR.responseText);
					}
				}
			});
		}
	}
	return false;
});
$('#currentPassword').on('focusout', function() {
	var currentPassword = $("#currentPassword").val();
	if (currentPassword == null || currentPassword == '') {
		$('#currentPassword').addClass("invalid");
		$('#error').text('current password field cannot be empty!');
		passwordError = true;
		return;
	}
	$('#currentPassword').removeClass("invalid");
	$('#error').html('&nbsp;');
	passwordError = false;
	return false;
});
$('#newPassword').on('focusout', function() {
    var newPassword = $("#newPassword").val();
	if (newPassword == null || newPassword == '') {
		$('#newPassword').addClass("invalid");
		$('#error').text('new password field cannot be empty!');
		passwordError = true;
		return;
	}
	$('#newPassword').removeClass("invalid");
	$('#error').html('&nbsp;');
	passwordError = false;
	return false;
});
$('#newPasswordCheck').on('focusout', function() {
	var newPassword = $("#newPassword").val();
	var newPasswordCheck = $("#newPasswordCheck").val();
	if (newPasswordCheck == null || newPasswordCheck == '') {
		$('#newPasswordCheck').addClass("invalid");
		$('#error').text('check password field cannot be empty!');
		passwordError = true;
	}
	if (newPassword != newPasswordCheck) {
		$('#newPasswordCheck').addClass("invalid");
		$('#error').text('retyped password does not match!');
		passwordError = true;
		return;
	}
	$('#newPasswordCheck').removeClass("invalid");
	$('#error').html('&nbsp;');
	passwordError = false;
	return false;
});

$(document).off('click', '.rep-popup');
$(document).on('click', '.rep-popup', function(e) {
	$.ajax({
		type: 'POST',
		url: '/ws/forum/new/reputation',
		async: false,
		success: function(data) {
			$('#notify-box').remove();
			window.open('//fextralife.com/forums/ucp.php?i=reputation&mode=list', '_blank');
		},
		error: function(jqXHR, textStatus, errorThrown) {
		}
	});
	return false;
});
$(document).off('click', '.rep-close');
$(document).on('click', '.rep-close', function(e) {
	$('#notify-box').remove();
	$('#notify-box').remove();
	return false;
});

function getURLParameter(sParam) {
	var sPageURL = window.location.search.substring(1);
	var sURLVariables = sPageURL.split('&');
	for (var i = 0; i < sURLVariables.length; i++) {
		var sParameterName = sURLVariables[i].split('=');
		if (sParameterName[0] == sParam) {
			return sParameterName[1];
		}
	}
}

// used by #fex-account for scroll event
function throttle(fn, threshhold, scope) {
	if (!isMobile) {
		threshhold || (threshhold = 250);
		var last, deferTimer;
		return function () {
			var context = scope || this;
			var now = +new Date, args = arguments;
			if (last && now < last + threshhold) {
				// hold on to it
				clearTimeout(deferTimer);
				deferTimer = setTimeout(function () {
					last = now;
					fn.apply(context, args);
				}, threshhold);
			} else {
				last = now;
				fn.apply(context, args);
			}
		};
	}
}

(function() {
  var initialized = false;

  function initResponsiveMenu() {
    if ($('#fex-menu-fixed:visible').length && !initialized) {
      $('#fex-menu-fixed > .toggle').on('click', function (event) {
        var $sidebar = $('#sidebar');
        if ($sidebar.hasClass('active')) {
          $sidebar.removeClass('active');
        } else {
          $sidebar.addClass('active');
        }
        return false;
      });

      $('#fex-menu-fixed:visible + .container-fluid #navMenu .navSubMenu').parent('li').on('click', function (event) {
        event.stopPropagation();
        var $li = $(this);
        $li.toggleClass('active');
      });

      initialized = true;
    }
  }

  $(window).on('resize', initResponsiveMenu);

  initResponsiveMenu();

  // animate login items
	$(window).on('scroll', throttle(function() {
		var fexAccount = $('#fex-account > .btn-group');
		if (window.pageYOffset > 10) {
			var amount = fexAccount.width() - parseInt(fexAccount.find(':first').css('width'));
			fexAccount.animate({'right': -amount });
		} else if (window.pageYOffset <= 10) {
			fexAccount.animate({'right': 0});
		}
	}, 300));
}());


var ttaux = null;
var timer = null;
var wttl = null;
$('.wiki_tooltip').each(function() {
	var link = $(this)[0].outerHTML;
	$(this).replaceWith('<span class="fextratip">' + link + '<span class="popover"><span class="arrow"></span><span class="popover-content"></span></span></span>');
});
$('.wiki_tooltip').mouseenter(function(event) {
	var link = $(this).parent().children().eq(0);
	var bwidth = this.parentNode.childNodes[0].offsetWidth;
	var bheight = this.parentNode.childNodes[0].offsetHeight;
	var locX = event.screenX;
	var locY = event.screenY;
	var elem = this.parentNode.childNodes[1].childNodes[1];
	if (elem.innerHTML == '') {
		wttl = link;
		ttaux = link;
		var url = link.attr('href').substring(0, link.attr('href').lastIndexOf('/') + 1) + '_tooltip_' + link.attr('href').substring(link.attr('href').lastIndexOf('/') + 1);
		$(elem).load(url, function() {
			$(elem.parentNode).fadeIn(0, function() {
				setloc(locX, locY, bwidth, bheight, elem.parentNode);
			});
			if (wttl != link) {
				$(elem.parentNode).fadeOut();
			}
			if (link == ttaux) {
				timer = setTimeout(function() {$(elem.parentNode).fadeIn(0);},10);
			}
		});
	} else {
		timer = setTimeout(function() {$(elem.parentNode).fadeIn(0);},10);
	}
	return false;
});
function setloc(locX, locY, bwidth, bheight, elem) {
	locX = locX + elem.offsetWidth + 15;
	locY = locY + elem.offsetHeight + 15;
	if ((locX + bwidth) > window.innerWidth) {
		elem.className = 'popover left';
		elem.style.right = String(bwidth + 9) + 'px';
		elem.style.top = '-' + String((elem.offsetHeight - bheight) / 2) + 'px';
		elem.style.display='none';
	} else {
		elem.className = 'popover right';
		elem.style.left = String(bwidth + 9) + 'px';
		elem.style.top = '-' + String((elem.offsetHeight - bheight) / 2) + 'px';
		elem.style.display='none';
	}
	return false;
}
$('.fextratip').mouseleave(function(event) {
	wttl = null;
	$(this.childNodes[1]).fadeOut(0);
	clearTimeout(timer);
	ttaux = null;
	return false;
});
$('.popover-content').mouseenter(function(event) {
	wttl = null;
	$(this.parentNode.parentNode.childNodes[1]).fadeOut(0);
	clearTimeout(timer);
	ttaux = null;
	return false;
});
$('.wcomp-article').load('//swcdn.fextralife.com/file/component-article.json?v='+new Date().getTime(),function() {
	calcDate($('.wcomp-article').find('.CompItemDate'));
});
$('.wcomp-articles').load('//swcdn.fextralife.com/file/component-articles.json?v='+new Date().getTime(),function() {
	calcDate($('.wcomp-articles').find('.CompItemDate'));
});
$('.wcomp-posts').load('//swcdn.fextralife.com/file/component-posts.json?v='+new Date().getTime(),function() {
	calcDate($('.wcomp-posts').find('.CompItemDate'));
});
function calcDate(dobject) {
	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	$.each(dobject, function() {
		var rdate = new Date(parseInt($(this).text()));
		var date = ("0" + rdate.getDate()).slice(-2) + ' ' + monthNames[rdate.getMonth()] + ' ' + rdate.getFullYear() + ' ' + ("0" + rdate.getHours()).slice(-2) + ':' + ("0" + rdate.getMinutes()).slice(-2);
		$(this).text(date);
	});
}

// Left Menu Code
// Add Menu Toggle icons
$("#navMenu> li:first-child").prepend('<span aria-hidden="true" id="navMenuCollapse" title="Click to Expand/Collapse all menus" class="glyphicon glyphicon-resize-full"></span>');
$('#navMenu .navSubMenu').parent('li').addClass('collapsible').prepend('<span aria-hidden="true" class="glyphicon glyphicon-menu-down collapseicon"></span>');

// Create OnClick Event Handlers for Menu Toggle Icons

// Collapse/Retract
$('.collapsible').on('click', function(event) {
	event.stopPropagation();
	var li = $(this);
	if ($(event.target).attr('id') == "navMenuCollapse") {
		if ($('#navMenuCollapse').hasClass('collapsed')) {
			$('#navMenu .collapsible').removeClass('activated');
			$('#navMenu .collapsible').removeClass('active');
			$('#navMenuCollapse').removeClass('collapsed');
			$('#navMenuCollapse').removeClass('glyphicon-resize-small');
			$('#navMenuCollapse').addClass('glyphicon-resize-full');
			$('.collapseicon').removeClass('glyphicon-menu-up');
			$('.collapseicon').addClass('glyphicon-menu-down');
		}
		// Menu is retracted
		else {
			$('#navMenu .collapsible').addClass('activated');
			$('#navMenu .collapsible').addClass('active');
			$('#navMenuCollapse').addClass('collapsed');
			$('#navMenuCollapse').addClass('glyphicon-resize-small');
			$('#navMenuCollapse').removeClass('glyphicon-resize-full');
			$('.collapseicon').addClass('glyphicon-menu-up');
			$('.collapseicon').removeClass('glyphicon-menu-down');
		}
	} else if ($(event.target).hasClass('collapsible')||$(event.target).hasClass('glyphicon-menu-down')||$(event.target).hasClass('glyphicon-menu-up')){
		if (li.hasClass('activated')) {
			li.removeClass('activated');
			li.removeClass('active');
			li.children('.glyphicon').first().removeClass('glyphicon-menu-up');
			li.children('.glyphicon').first().addClass('glyphicon-menu-down');
		} else {
			li.addClass('activated');
			li.addClass('active');
			li.children('.glyphicon').first().addClass('glyphicon-menu-up');
			li.children('.glyphicon').first().removeClass('glyphicon-menu-down');
		}
	}
});
// Fix Mobile Menu Tags:
$('#navMenu li').on('click', function(event) {
	if ($(this).hasClass('active')){
		$(this).children('.collapseicon:first-child').addClass('glyphicon-menu-up');
		$(this).children('.collapseicon:first-child').removeClass('glyphicon-menu-down');
	} else {
		$(this).children('.collapseicon:first-child').removeClass('glyphicon-menu-up');
		$(this).children('.collapseicon:first-child').addClass('glyphicon-menu-down');
	}
});
// Off Screen Detection
jQuery.expr.filters.offscreen = function(el) {
var rect = el.getBoundingClientRect();
return (
		(rect.x + rect.width) < 0
			|| (rect.y + rect.height) < 0
			|| (rect.x > window.innerWidth || rect.y > window.innerHeight)
		);
};

// When scrolling, check if the menu is visible or not
$(window).on('resize scroll', function() {
if ($('#navMenu').is(':offscreen')) {
	$('.fixme').css({'position':'fixed'});

} else {
	$('.fixme').css({'position':'relative'});
}
});














			$(document).ready(function() {
				/* fix for the search bar when used via mobile and tablet */
				$('#page-name-search').bind('blur', function() {
					$('#sidebar').removeClass('neutro').addClass('active');
				});
				$('#page-name-search').bind('focus', function() {
					$('#sidebar').removeClass('active').addClass('neutro');
				});
			});
			$('img.lazyload').lazyload({
				failure_limit : 999999
			});


var ofixme = $('.fixme');
if (ofixme.length > 0) {
	var fixmeTop = $('.fixme').offset().top;
	$(window).scroll(function() {
		var currentScroll = $(window).scrollTop();
		if (currentScroll >= fixmeTop) {
			$('.fixme').css({position: 'fixed', top: '60px',});
		} else {
			$('.fixme').css({position: 'static'});
		}
	});
}

//if ($.cookie("css")) {
var ccss = getCookie("css");
if (ccss != null) {
	$("link.stylechanger").attr("href",ccss);
}
$(document).ready(function() {
	$("#btn-switch li a").click(function() {
		$("link.stylechanger").attr("href",$(this).attr('rel'));
		setCookie("css", $(this).attr('rel'), 365);
		return false;
	});
});
//-----------------------------------
function loadJSON(callback) {
	var xobj = new XMLHttpRequest();
	xobj.overrideMimeType("application/json");
	xobj.open('GET', '/onlineusers.json?v=' + new Date().getTime(), true); // Replace 'my_data' with the path to your file
	xobj.onreadystatechange = function () {
		if (xobj.readyState == 4 && xobj.status == "200") {
			// Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
			callback(xobj.responseText);
		}
	};
	xobj.send(null);
}
window.onload = function() {
    //dom not only ready, but everything is loaded
	if (!(typeof hasOnlineUsers === 'undefined') && hasOnlineUsers == true) {
		loadJSON(function(response) {
			  // Parse JSON string into object
			var data = JSON.parse(response);
			if (data != null && data.onlineUsers != null && data.onlineUsers != '') {
				var ouv = $('.onlineusers');
				ouv.parent().parent().css('display','');
				ouv.parent().css('display','');
				ouv.text(data.onlineUsers);
			}
		});
	}
};
if (ua == '111' || ua == '211') {
	var comments = $('#discussions').children();
	$.each(comments, function() {
		var oo = $(this);
		var id = oo.attr('id');
		var comment = $('#' + id);
		var stickyId = oo.attr('data-sticky');
		if (stickyId != null) {
			comment.children().eq(0).children().eq(0).children().eq(1).children().eq(0).children().eq(2).children().eq(1).append('&nbsp;&nbsp;<span class="unmakesticky glyphicon glyphicon-pushpin" aria-hidden="true" title="unmake comment sticky"></span>');
		} else {
			comment.children().eq(0).children().eq(0).children().eq(1).children().eq(0).children().eq(2).children().eq(1).append('&nbsp;&nbsp;<span class="makesticky glyphicon glyphicon-pushpin" aria-hidden="true" title="make comment sticky"></span>');
		}
	});
}
$(document).off('click', '.usrSignIn');
$(document).on('click', '.usrSignIn', function(e) {
	window.location.href = '/wiki/authentication';
	return false;
});
$(document).on('click', '#usrSignOut', function(e) {
	pagex['userName'] = null;
	$('#form-header').submit();
	return false;
});
$(document).off('click', '.buser-options');
$(document).on('click', '.buser-options', function(e) {
	var obj = $('.muser-options');
	if ($('.mhelp-options').css('display') == 'block') {
		$('.mhelp-options').css('display','none');
	}
	if (obj.css('display') == 'block') {
		obj.css('display','none');
	} else {
		if (!$('#umname').hasClass('usrSignIn')) {
			obj.css('display','block');
		}
	}
	return false;
});
$(document).off('click', '.buser-options-desktop');
$(document).on('click', '.buser-options-desktop', function(e) {
	var obj = $('.muser-options');
	if ($('.mhelp-options').css('display') == 'block') {
		$('.mhelp-options').css('display','none');
	}
	if (obj.css('display') == 'block') {
		obj.css('display','none');
	} else {
		if (!$('#umname').hasClass('usrSignIn')) {
			obj.css('display','block');
		}
	}
	return false;
});
$(document).off('click', '.buser-options-mobile');
$(document).on('click', '.buser-options-mobile', function(e) {
	var obj = $('.muser-options');
	if ($('.mhelp-options').css('display') == 'block') {
		$('.mhelp-options').css('display','none');
	}
	if (obj.css('display') == 'block') {
		obj.css('display','none');
	} else {
		if (!$('#umname').hasClass('usrSignIn')) {
			obj.css('display','block');
		}
	}
	return false;
});
$(document).off('click', '.bhelp-options');
$(document).on('click', '.bhelp-options', function(e) {
	var obj = $('.mhelp-options');
	if ($('.muser-options').css('display') == 'block') {
		$('.muser-options').css('display','none');
	}
	if (obj.css('display') == 'block') {
		obj.css('display','none');
	} else {
		obj.css('display','block');
	}
	return false;
});
$(document).off('click', '#userMenuBtn');
$(document).on('click', '#userMenuBtn', function(e) {
	var $this = $(this);
	var $prev = $this.prev('.sub');
	if ($('#user-menu').hasClass('show')) {
		$('#user-menu').removeClass('show');
	} else {
		$('#user-menu').addClass('show');
	}
	$prev.css('right', parseInt($this.css('width')) + 14);
	return false;
});
$(document).off('click', '.btn-switch');
$(document).on('click', '.btn-switch', function(e) {
	$("link.stylechanger").attr("href",$(this).attr('rel'));
	setCookie("css", $(this).attr('rel'), 365);
	return false;
});
function filterSearchable(text, key) {
	var filter = text;
	var elements = document.getElementsByClassName('searchable');
	for (var index = 0; index < elements.length; index++) {
		var tag = elements.item(index);
		if (key == tag.getAttribute('data-key')) {
			if (tag.tagName == 'UL') {
				var li = tag.getElementsByTagName('li');
				// Loop through all list items, and hide those who don't match the search query
				for (i = 0; i < li.length; i++) {
					var a = li[i].getElementsByTagName("a")[0];
					var txtValue = a.textContent || a.innerText;
					if (txtValue.toUpperCase().indexOf(filter) > -1) {
						li[i].style.display = "";
					} else {
						li[i].style.display = "none";
					}
				}
			} else if (tag.tagName == 'TABLE') {
				var tr = tag.getElementsByTagName("tr");
				// Loop through all table rows, and hide those who don't match the search query
				for (i = 0; i < tr.length; i++) {
					var tds = tr[i].getElementsByTagName("td");
					var j = 0;
					var found = false;
					while (!found && j < tds.length) {
						var td = tds[j];
						if (td) {
							var txtValue = td.textContent || td.innerText;
							found = txtValue.toUpperCase().indexOf(filter) > -1;
						}
						j++;
					}
					if (found || tds.length == 0) {
						tr[i].style.display = "";
					} else {
						tr[i].style.display = "none";
					}
				}
			}
		}
	}
	return false;
}
$('#map').mousemove(function(event) {
	var left = event.pageX - $(this).offset().left;
	var top = event.pageY - $(this).offset().top;
	$('#coordinates').val(left + ':' + top);
	return false;
});
$(document).off('change', '#map-selections');
$(document).on('change', '#map-selections', function(e) {
	if ($(this).prop('checked')) {
		$('.map-category').prop('checked', true);
		$('.map-item').show();
	} else {
		$('.map-category').prop('checked', false);
		$('.map-item').hide();
	}
	return false;
});
$(document).off('change', '.map-category');
$(document).on('change', '.map-category', function(e) {
	var categoryId = $(this).attr('id');
	if ($(this).is(':checked')) {
		$('.' + categoryId).show();
	} else {
		$('.' + categoryId).hide();
	}
	return false;
});

$('.youtube').each(function() {
	var vbimage = ($(this).attr('data') != null ? $(this).attr('data') : 'https://i.ytimg.com/vi/' + this.id + '/sddefault.jpg');
	$(this).css('background-image', 'url(' + vbimage + ')');
	$(this).append($('<div/>', {'class': 'play'}));
	$(document).delegate('#'+this.id, 'click', function() {
		var iframe_url = "https://www.youtube.com/embed/" + this.id + "?autoplay=1&autohide=1";
		if ($(this).data('params')) iframe_url+='&'+$(this).data('params');
		var iframe = $('<iframe/>', {'frameborder': '0', 'src': iframe_url, 'width': $(this).width(), 'height': $(this).height() })
		$(this).replaceWith(iframe);
	});
});

// wiki tables search
var originalStructures = new Map();

// Function to filter divs based on the input search text
function filterDivs(inputElement, containerClasses) {
	// Get the uppercase value of the search input
	const filter = inputElement.value.toUpperCase();

	// Iterate through each container class in the containerClasses array
	for (var aindex = 0; aindex < containerClasses.length; aindex++) {
		// Get all the div container elements with the specified class
		const divContainers = document.getElementsByClassName(containerClasses[aindex]);

		// Iterate through each div container
		for (var bindex = 0; bindex < divContainers.length; bindex++) {
			var divContainer = divContainers[bindex];
			// Check if the original structure of the container is stored in the Map
			if (!originalStructures.has(divContainer)) {
				// If not, store a clone of the div container as the original structure in the Map
				originalStructures.set(divContainer, divContainer.cloneNode(true));
			} else {
				// If the original structure is stored, restore it before filtering
				divContainer.innerHTML = originalStructures.get(divContainer).innerHTML;
			}

			// Get the updated div elements after restoring the original structure
			const updatedDivs = Array.from(divContainer.getElementsByClassName('filter-item'));

			// Filter visible divs based on the search input
			const visibleDivs = updatedDivs.filter(function(div) {
				const txtValue = div.textContent || div.innerText;
				const isVisible = txtValue.toUpperCase().indexOf(filter) > -1;
				div.style.display = isVisible ? "block" : "none";
				return isVisible;
			});

			// Clear the div container's inner HTML to prepare for adding the filtered divs
			divContainer.innerHTML = '';

			// Initialize variables to hold the current row element and xs-6 count
			var currentRow;
			var xs6Count = 0;

			// Iterate through the visible divs array
			visibleDivs.forEach(function(div, index) {
				// Check if the index is a multiple of 4 (0, 4, 8, etc.)
				if (index % 4 === 0) {
					// If it is, create a new row div element and set its class name to "row"
					currentRow = document.createElement('div');
					currentRow.className = 'row';
					// Append the new row to the div container
					divContainer.appendChild(currentRow);
				}

				// Check if the div has a class of 'col-xs-6'
				if (div.classList.contains('col-xs-6')) {
					xs6Count++;
				}

				// Append the visible div to the current row
				currentRow.appendChild(div);

				// Check if there are two 'xs-6' divs and the index is not the last element
				if (xs6Count === 2 && index !== visibleDivs.length - 1) {
					// If it is, add a clearfix div after every two 'xs-6' divs
					const clearfixDiv = document.createElement('div');
					clearfixDiv.className = 'clearfix visible-xs visible-sm visible-md';
					clearfixDiv.style.position = 'static!important';
					currentRow.appendChild(clearfixDiv);
					// Reset the xs-6 count
					xs6Count = 0;
				}
			});
		}
	}
}
// wiki chat vip switch on/off
var fwvcc = getCookie('fwvcc');
if (ua != null && (ua == '100' || ua == '110' || ua == '210' || ua == '111' || ua == '211' )) {
	var tempDiv = document.createElement('div');
	if (fwvcc != null && fwvcc == 'off') {
		tempDiv.innerHTML = '<li><a id="btnChatOn" href="#">Set Chat on</a></li>';
	} else {
		tempDiv.innerHTML = '<li><a id="btnChatOff" href="#">Set chat off</a></li>';
	}
	var chatSwitchButton = tempDiv.firstChild;
	const userOptions = document.querySelectorAll('.user-options');
	userOptions.forEach(function(ul) {
		const lastLiElement = ul.querySelector('li:last-child');
		ul.insertBefore(chatSwitchButton.cloneNode(true), lastLiElement);
	});
	const userOptionsDesktop = document.querySelectorAll('.user-options-desktop');
	userOptionsDesktop.forEach(function(ul) {
	const lastLiElement = ul.querySelector('li:last-child');
	ul.insertBefore(chatSwitchButton.cloneNode(true), lastLiElement);
});
const userOptionsMobile = document.querySelectorAll('.user-options-mobile');
userOptionsMobile.forEach(function(ul) {
	const lastLiElement = ul.querySelector('li:last-child');
	ul.insertBefore(chatSwitchButton.cloneNode(true), lastLiElement);
});
}
function updateChatOption(chatSwitchButton) {
	const userOptions = document.querySelectorAll('.user-options');
	userOptions.forEach(function(ul) {
		var lis = ul.querySelectorAll('li');
		var liid = lis[lis.length -2].firstElementChild.id;
		if (liid == 'btnChatOn') {
			ul.removeChild(lis[lis.length -2]);
		}
		const lastLiElement = ul.querySelector('li:last-child');
		ul.insertBefore(chatSwitchButton.cloneNode(true), lastLiElement);
	});
	var dropdownElement = document.getElementById('menu-user-slot');
	if (dropdownElement.classList.contains('open')) {
		dropdownElement.classList.remove('open');
	} else {
		dropdownElement.classList.add('open');
	}

	const userOptionsDesktop = document.querySelectorAll('.user-options-desktop');
	userOptionsDesktop.forEach(function(ul) {
		var lis = ul.querySelectorAll('li');
		var liid = lis[lis.length -2].firstElementChild.id;
		if (liid == 'btnChatOn') {
			ul.removeChild(lis[lis.length -2]);
		}
		const lastLiElement = ul.querySelector('li:last-child');
		ul.insertBefore(chatSwitchButton.cloneNode(true), lastLiElement);
	});
	const userOptionsMobile = document.querySelectorAll('.user-options-mobile');
	userOptionsMobile.forEach(function(ul) {
		var lis = ul.querySelectorAll('li');
		var liid = lis[lis.length -2].firstElementChild.id;
		if (liid == 'btnChatOn') {
			ul.removeChild(lis[lis.length -2]);
		}
		const lastLiElement = ul.querySelector('li:last-child');
		ul.insertBefore(chatSwitchButton.cloneNode(true), lastLiElement);
	});
	var dropdownElementDesktop = document.getElementById('menu-user-slot-desktop');
	if (dropdownElementDesktop.classList.contains('open')) {
		dropdownElementDesktop.classList.remove('open');
	} else {
		dropdownElementDesktop.classList.add('open');
	}
	var dropdownElementDesktop1 = document.getElementById('menu-user-slot-desktop1');
	if (dropdownElementDesktop1.classList.contains('open')) {
		dropdownElementDesktop1.classList.remove('open');
	} else {
		dropdownElementDesktop1.classList.add('open');
	}
	var dropdownElementMobile = document.getElementById('menu-user-slot-mobile');
	if (dropdownElementMobile.classList.contains('open')) {
		dropdownElementMobile.classList.remove('open');
	} else {
		dropdownElementMobile.classList.add('open');
	}

	location.reload();
	return false;
}
$(document).off('click', '#btnChatOff');
$(document).on('click', '#btnChatOff', function(e) {
	setCookie('fwvcc','off',100);
	var tempDiv = document.createElement('div');
	tempDiv.innerHTML = '<li><a id="btnChatOn" href="#">Set Chat on</a></li>';
	var chatSwitchButton = tempDiv.firstChild;
	updateChatOption(chatSwitchButton);
	return false;
});
$(document).off('click', '#btnChatOn');
$(document).on('click', '#btnChatOn', function(e) {
	setCookie('fwvcc','on',100);
	var tempDiv = document.createElement('div');
	tempDiv.innerHTML = '<li><a id="btnChatOff" href="#">Set Chat off</a></li>';
	var chatSwitchButton = tempDiv.firstChild;
	updateChatOption(chatSwitchButton);
	location.reload();
	return false;
});
});

function getFXDomain() {
	const domain = window.location.hostname;
	const parts = domain.split('.');
	const isDev = parts.includes('dev');
	const isCom = parts.includes('com');
	if (!isDev && !isCom) {
		return null; // Not a fextralife domain
	}
	if (isDev){
		return 'fextralife.dev';
	}
	const fextralifeIndex = parts.findIndex(p => p === 'fextralife');
	if (parts[fextralifeIndex - 1] === 'wiki') {
		return 'fextralife.com';
	}const potentialQADomain = parts[fextralifeIndex - 1];
	if (/^qa\d+$/.test(potentialQADomain)) {
		return potentialQADomain + `.fextralife.com`;
	}return 'fextralife.com';
}

window.assignDisplayCardHyperlinkHoverHandlers = function () {
  const cache = {};
  const VIGNETTE_CLASS = 'tag-vignette';
  let currentVignette = null;
  let hideTimer = null;

  function isMobile() {
    return window.device === 'mobile' || window.isIOS;
  }

  function injectCSS(css) {
    let styleEl = document.querySelector('#customUniqueCSS');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'customUniqueCSS';
      document.head.appendChild(styleEl);
    }
    if (!styleEl.innerHTML.includes(css)) {
      styleEl.innerHTML += css;
    }
  }

  function showVignette(tagId, target, vignetteData, link) {
    if (currentVignette && currentVignette.parentElement) {
      currentVignette.remove();
      currentVignette = null;
    }

    injectCSS(vignetteData.css);

    const container = document.body;
    const vignette = document.createElement('div');
    vignette.id = 'tag-' + tagId + '-vignette';
    vignette.className = VIGNETTE_CLASS;
    vignette.innerHTML = vignetteData.html;
    vignette.style.position = 'absolute';
    vignette.style.zIndex = 1000;
    vignette.style.display = 'none';

    container.appendChild(vignette);
    positionVignette(target, vignette);
    vignette.style.display = 'block';
    currentVignette = vignette;

    target.addEventListener('mouseleave', startHideTimer);
    target.addEventListener('mouseenter', cancelHideTimer);
    vignette.addEventListener('mouseleave', startHideTimer);
    vignette.addEventListener('mouseenter', cancelHideTimer);
  }

  function positionVignette(target, vignette) {
    const rect = target.getBoundingClientRect();
    vignette.style.top = window.scrollY + rect.bottom + 5 + 'px';
    vignette.style.left = window.scrollX + rect.left + 'px';
  }

  function startHideTimer() {
    hideTimer = setTimeout(() => {
      if (currentVignette) {
        currentVignette.remove();
        currentVignette = null;
      }
    }, 200);
  }

  function cancelHideTimer() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  }

  function fetchAndShowVignette(tagId, target) {
    const link = target.querySelector('a');

    if (cache[tagId] && cache[tagId].vignette) {
      showVignette(tagId, target, cache[tagId].vignette, link);
      return;
    }

    const request = new XMLHttpRequest();
    request.open('GET', 'https://fextralife.com/fetch/tag/' + tagId + '/vignette', true);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
        const response = JSON.parse(request.responseText);
        if (response.success && response.vignette) {
          cache[tagId] = { vignette: response.vignette };
          showVignette(tagId, target, response.vignette, link);
        } else {
          target.classList.add('display-card-hyperlink-no-vignette');
        }
        target.classList.remove('is-loading');
      }
    };

    request.send();
  }

  document.querySelectorAll('.display-card-hyperlink').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      const tagId = el.getAttribute('data-id');
      if (!tagId) return;
      el.classList.add('is-loading');
      fetchAndShowVignette(tagId, el);
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  window.assignDisplayCardHyperlinkHoverHandlers();
});
